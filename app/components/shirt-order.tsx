"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Box, ChevronLeft, ChevronRight, Expand, LoaderCircle, Minus,
  Plus, Send, ShoppingCart, Shirt, Trash2, X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TurnstileWidget } from "./turnstile-widget";

const shirtVariants = [
  { id: "rise-off-white", name: "Rise Off-white", edition: "Camiseta Rise — Levanta-te Off-white", color: "Off-white", image: "/assets/miniatura-rise-offwhite-wireframe.png", embeddedThumbnailCopy: true, available: false },
  { id: "rise-roxa", name: "Rise Roxa", edition: "Camiseta Rise — Levanta-te Roxa", color: "Roxa", image: "/assets/miniatura-rise-roxa-wireframe.png", embeddedThumbnailCopy: true, available: false },
  { id: "geracao", name: "Geração que se levanta", edition: "Camiseta Rise — Geração que se levanta", color: "Preta", image: "/assets/miniatura-rise-geracao-wireframe.png", embeddedThumbnailCopy: true, available: true },
] as const;

const sizes = ["PP", "P", "M", "G", "GG"] as const;
const variantPhotos: Record<string, string[]> = {
  "rise-off-white": [
    "/assets/camiseta-rise-offwhite-frente.png",
    "/assets/camiseta-rise-offwhite-costas.png",
    "/assets/camiseta-rise-offwhite-cabide.png",
    "/assets/camiseta-rise-offwhite-mesa.png",
  ],
  "rise-roxa": [
    "/assets/camiseta-rise-roxa-frente.png",
    "/assets/camiseta-rise-roxa-costas.png",
    "/assets/camiseta-rise-roxa-frente-estudio.png",
    "/assets/camiseta-rise-roxa-detalhe.png",
  ],
  geracao: [
    "/assets/camiseta-rise-geracao-cabide.png",
    "/assets/camiseta-rise-geracao-frente.png",
    "/assets/camiseta-rise-geracao-costas.png",
    "/assets/camiseta-rise-geracao-detalhe.png",
  ],
};

type CartItem = {
  id: string;
  name: string;
  edition: string;
  color: string;
  size: (typeof sizes)[number];
  quantity: number;
  unitPriceCents: number;
  image: string;
};

export function ShirtOrder() {
  const [product, setProduct] = useState<"shirt" | "presskit">("shirt");
  const [variantIndex, setVariantIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [size, setSize] = useState<(typeof sizes)[number]>("M");
  const [quantity, setQuantity] = useState(1);
  const [pagamento, setPagamento] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const portalMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idempotencyKey = useRef<string | null>(null);
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);
  const selectedVariant = shirtVariants[variantIndex];
  const isPresskit = product === "presskit";
  const isPurchasable = !isPresskit && selectedVariant.available;
  const currentPhoto = isPresskit
    ? "/assets/presskit-rise-featured.jpg"
    : (variantPhotos[selectedVariant.id] ?? [selectedVariant.image])[photoIndex];
  const cartItem = cartItems[0] ?? null;
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotalCents = cartItems.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);

  function selectProduct(nextProduct: "shirt" | "presskit") {
    setProduct(nextProduct);
    if (nextProduct === "shirt") setVariantIndex(0);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? 1 : event.key === "ArrowRight" ? (index + 1) % 2 : (index - 1 + 2) % 2;
    selectProduct(nextIndex === 0 ? "shirt" : "presskit");
    tabRefs.current[nextIndex]?.focus();
  }

  function movePhoto(direction: -1 | 1) {
    const photos = variantPhotos[selectedVariant.id] ?? [selectedVariant.image];
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  }

  function addToCart() {
    if (!isPurchasable) return;
    const nextItem: CartItem = {
      id: `${selectedVariant.id}-${size}`,
      name: selectedVariant.name,
      edition: selectedVariant.edition,
      color: selectedVariant.color,
      size,
      quantity,
      unitPriceCents: 4999,
      image: selectedVariant.image,
    };
    setCartItems((current) => {
      const existing = current.find((item) => item.id === nextItem.id);
      if (!existing) return [...current, nextItem];
      return current.map((item) => item.id === nextItem.id
        ? { ...item, quantity: Math.min(5, item.quantity + nextItem.quantity) }
        : item);
    });
    setCartOpen(true);
  }

  function updateCartQuantity(id: string, delta: -1 | 1) {
    setCartItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const nextQuantity = item.quantity + delta;
      return nextQuantity > 0 ? [{ ...item, quantity: Math.min(5, nextQuantity) }] : [];
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pagamento || !turnstileToken || !confirmed) return;
    if (!cartItem) return;
    const data = new FormData(event.currentTarget);
    setSending(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "shirt",
          idempotencyKey: idempotencyKey.current ?? (idempotencyKey.current = crypto.randomUUID()),
          turnstileToken,
          website: data.get("website"),
          consent: confirmed,
          privacyVersion: "2026-10",
          nome: data.get("nome"),
          telefone: data.get("telefone"),
          edition: cartItem.edition,
          size: cartItem.size,
          color: cartItem.color,
          quantity: String(cartItem.quantity),
          pagamento,
        }),
      });
      const result = await response.json() as { protocol?: string; error?: string };
      if (!response.ok || !result.protocol) throw new Error(result.error ?? "O pedido não foi registrado.");
      idempotencyKey.current = null;
      if (pagamento === "PIX" || pagamento === "Cartão") {
        const checkoutResponse = await fetch("/api/mercadopago/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "shirt", protocol: result.protocol, pagamento, product: "shirt", quantity: cartQuantity }),
        });
        const checkout = await checkoutResponse.json() as { checkoutUrl?: string; error?: string };
        if (!checkoutResponse.ok || !checkout.checkoutUrl) throw new Error(checkout.error ?? "O pedido foi salvo, mas não foi possível abrir o pagamento.");
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      const itemsMessage = cartItems.map((item) => `${item.name} — ${item.color}, tamanho ${item.size}, ${item.quantity} unidade${item.quantity === 1 ? "" : "s"}`).join("; ");
      const message = [
        "Olá, equipe Rise! Meu pedido foi registrado no site.", `Protocolo: ${result.protocol}`,
        `Nome: ${String(data.get("nome") ?? "")}`, `Itens: ${itemsMessage}`,
        `Total: R$ ${(cartTotalCents / 100).toFixed(2).replace(".", ",")}`,
        `Pagamento: ${pagamento}`, "Podem me confirmar a disponibilidade e o pagamento?",
      ].join("\n");
      const whatsappNumber = pagamento === "Dinheiro" ? "5511971590456" : "5511968778688";
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setCheckoutOpen(false);
    setCartItems([]);
      setCartOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos registrar o pedido agora.");
      setResetSignal((value) => value + 1);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rise-storefront">
      <Toaster richColors position="top-center" />
      <div className="rise-storefront-bar">
        <a className="rise-storefront-brand" href="#rise-products" aria-label="Produtos Rise"><span>COLETIVO</span><strong>Rise</strong><i aria-hidden="true" /></a>
        <div className="rise-product-tabs" role="tablist" aria-label="Categorias da loja">
          <button ref={(element) => { tabRefs.current[0] = element; }} id="tab-shirts" type="button" role="tab" aria-selected={product === "shirt"} aria-controls="rise-product-panel" tabIndex={product === "shirt" ? 0 : -1} className={product === "shirt" ? "is-selected" : ""} onClick={() => selectProduct("shirt")} onKeyDown={(event) => handleTabKeyDown(event, 0)}>
            <Shirt aria-hidden="true" /><span><strong>Camisetas</strong></span>
          </button>
          <button ref={(element) => { tabRefs.current[1] = element; }} id="tab-presskit" type="button" role="tab" aria-selected={product === "presskit"} aria-controls="rise-product-panel" tabIndex={product === "presskit" ? 0 : -1} className={product === "presskit" ? "is-selected" : ""} onClick={() => selectProduct("presskit")} onKeyDown={(event) => handleTabKeyDown(event, 1)}>
            <Box aria-hidden="true" /><span><strong>Presskit</strong><small>Kit de produtos e materiais Rise</small></span>
          </button>
        </div>
        <div className="rise-storefront-signature" aria-label="Levanta-te e resplandece"><p>LEVANTA-TE<br />E RESPLANDECE</p><i aria-hidden="true" /></div>
        {portalMounted && createPortal(<div className={`rise-cart-wrap${imageOpen || videoOpen || checkoutOpen ? " is-dialog-open" : ""}`}>
          <button type="button" className="rise-cart-trigger" aria-expanded={cartOpen} aria-controls="rise-cart-card" onClick={() => setCartOpen((value) => !value)}>
            <ShoppingCart aria-hidden="true" /><span>Carrinho</span><b>{cartQuantity}</b>
          </button>
          {cartOpen && <div id="rise-cart-card" className="rise-cart-card" role="dialog" aria-label="Carrinho de compras">
            <div className="rise-cart-card-heading"><div><span>Seu carrinho</span><strong>{cartItems.length ? `${cartItems.length} seleção${cartItems.length === 1 ? "" : "ões"}` : "Carrinho vazio"}</strong></div><ShoppingCart aria-hidden="true" /></div>
            {cartItems.length ? <>
              <div className="rise-cart-items">
                {cartItems.map((item) => <div className="rise-cart-item" key={item.id}>
                  <img src={item.image} alt="" />
                  <div><strong>{item.name}</strong><span>Tamanho {item.size} · {item.quantity} un.</span><b>R$ {(item.unitPriceCents * item.quantity / 100).toFixed(2).replace(".", ",")}</b></div>
                  <div className="rise-cart-item-actions">
                    <button type="button" aria-label={`Diminuir quantidade de ${item.name}`} onClick={() => updateCartQuantity(item.id, -1)}>−</button>
                    <button type="button" aria-label={`Aumentar quantidade de ${item.name}`} onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                    <button type="button" aria-label={`Remover ${item.name} do carrinho`} onClick={() => setCartItems((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 aria-hidden="true" /></button>
                  </div>
                </div>)}
              </div>
              <div className="rise-cart-total"><span>Total</span><strong>R$ {(cartTotalCents / 100).toFixed(2).replace(".", ",")}</strong></div>
              <button type="button" className="rise-cart-checkout" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Finalizar compra</button>
            </> : <p className="rise-cart-empty">Escolha uma camiseta para começar.</p>}
          </div>}
        </div>, document.body)}
      </div>

      <div className="rise-storefront-heading" id="rise-products">
        <div><h2>Produtos Rise <i aria-hidden="true" /></h2><p>Escolha sua camiseta e veja todos os detalhes.</p></div>
        <p>MAIS QUE<br />ROUPAS, UMA<br />MENSAGEM<br />EM MOVIMENTO.</p>
      </div>

      <div id="rise-product-panel" role="tabpanel" aria-labelledby={product === "shirt" ? "tab-shirts" : "tab-presskit"} className="rise-product-layout">
        <div className="rise-product-gallery">
          <div className="rise-product-thumbnails" aria-label="Modelos disponíveis">
            {(isPresskit ? [{ id: "presskit", name: "Presskit Rise", image: "/assets/presskit-rise-featured.jpg" }] : shirtVariants).map((item, index) => (
              <button type="button" key={item.id} className={`${!isPresskit && variantIndex === index ? "is-selected " : ""}${"embeddedThumbnailCopy" in item && item.embeddedThumbnailCopy ? "has-embedded-copy" : ""}`} aria-pressed={!isPresskit && variantIndex === index} onClick={() => { if (!isPresskit) { setVariantIndex(index); setPhotoIndex(0); } }}>
                <img src={item.image} alt="" /><span>{item.name}</span><ChevronRight className="rise-thumb-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="rise-product-stage">
            <div className="rise-stage-instruction"><strong><Box /> Produto</strong><span>Veja os detalhes da camiseta.</span><button type="button" className="rise-view-3d-button" onClick={() => setVideoOpen(true)}>Veja 3D</button></div>
            <button type="button" className="rise-stage-expand" onClick={() => setImageOpen(true)} aria-label="Ampliar imagem do produto"><Expand /></button>
            {!isPresskit && <button type="button" className="rise-stage-arrow rise-stage-prev" onClick={() => movePhoto(-1)} aria-label="Foto anterior"><ChevronLeft /></button>}
            <div className="rise-stage-media">
              <img className="rise-stage-image" src={currentPhoto} alt={isPresskit ? "Presskit Rise completo" : `${selectedVariant.name}, foto ${photoIndex + 1}`} />
            </div>
            {!isPresskit && <button type="button" className="rise-stage-arrow rise-stage-next" onClick={() => movePhoto(1)} aria-label="Próxima foto"><ChevronRight /></button>}
            {!isPresskit && <div className="rise-view-switcher" role="group" aria-label="Fotos da camiseta">
              {(variantPhotos[selectedVariant.id] ?? [selectedVariant.image]).map((_, index) => <button key={index} type="button" className={photoIndex === index ? "is-selected" : ""} aria-label={`Ver foto ${index + 1}`} aria-pressed={photoIndex === index} onClick={() => setPhotoIndex(index)}><span aria-hidden="true" /></button>)}
            </div>}
          </div>
        </div>

        <aside className="rise-purchase-card" aria-label="Configurar produto">
          <div className="rise-purchase-title"><div><h3>{isPresskit ? "Presskit Rise" : `${selectedVariant.name}.`}</h3><p>{isPresskit ? "Kit completo com produtos e materiais Rise." : "Camiseta oversized em algodão premium."}</p></div><i aria-hidden="true" /></div>
          <strong className="rise-product-price" aria-live="polite">{isPurchasable ? "R$ 49,99" : "Em breve"}</strong>
          {isPurchasable && <>
            <fieldset className="rise-option-group"><legend>Tamanho</legend><div className="rise-size-options">{sizes.map((item) => <button key={item} type="button" className={size === item ? "is-selected" : ""} aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}</div></fieldset>
            <fieldset className="rise-option-group"><legend>Quantidade</legend><div className="rise-quantity-control">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Diminuir quantidade"><Minus /></button>
              <output aria-live="polite" aria-label={`${quantity} unidade${quantity === 1 ? "" : "s"}`}>{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(5, value + 1))} disabled={quantity === 5} aria-label="Aumentar quantidade"><Plus /></button>
            </div></fieldset>
          </>}
          <button type="button" className="rise-add-cart" disabled={!isPurchasable} onClick={addToCart}>{isPurchasable ? "Adicionar ao carrinho" : "Em breve"}<ShoppingCart aria-hidden="true" /></button>
          <div className="rise-purchase-message"><i aria-hidden="true" /><p>Mais que roupas,<br />uma mensagem em movimento.</p><ChevronRight aria-hidden="true" /></div>
        </aside>
      </div>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="rise-image-dialog" showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle className="sr-only">Imagem ampliada do produto</DialogTitle>
          <DialogClose className="rise-dialog-close" aria-label="Fechar imagem ampliada"><X /></DialogClose>
          <img src={currentPhoto} alt={isPresskit ? "Presskit Rise completo" : `${selectedVariant.name}, foto ${photoIndex + 1}`} />
        </DialogContent>
      </Dialog>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="rise-video-dialog" showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle className="sr-only">Vídeo 3D da camiseta</DialogTitle>
          <DialogClose className="rise-dialog-close" aria-label="Fechar vídeo 3D"><X /></DialogClose>
          <video className="rise-3d-video" src="/assets/rise-camiseta-3d.mp4" autoPlay muted playsInline controls />
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="rise-checkout-dialog" showCloseButton={false}>
          <DialogClose className="rise-dialog-close" aria-label="Fechar dados do pedido"><X /></DialogClose>
          <DialogHeader><DialogTitle>Finalize seu pedido</DialogTitle><DialogDescription>{cartItems.length} seleção{cartItems.length === 1 ? "" : "ões"}, {cartQuantity} unidade{cartQuantity === 1 ? "" : "s"} — R$ {(cartTotalCents / 100).toFixed(2).replace(".", ",")}.</DialogDescription></DialogHeader>
          <form className="rise-checkout-form" onSubmit={handleSubmit}>
            <label className="form-honeypot" aria-hidden="true">Não preencha este campo<Input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="field"><span>Seu nome *</span><Input name="nome" required autoComplete="name" placeholder="Como podemos te chamar?" /></label>
            <label className="field"><span>Telefone / WhatsApp *</span><Input name="telefone" type="tel" autoComplete="tel" required placeholder="(11) 99999-9999" /></label>
            <label className="field"><span>Forma de pagamento *</span><Select value={pagamento} onValueChange={setPagamento} required><SelectTrigger className="form-select"><SelectValue placeholder="Escolha uma forma" /></SelectTrigger><SelectContent>{["PIX", "Cartão", "Dinheiro"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent></Select></label>
            <TurnstileWidget action="shirt_order" onToken={handleToken} resetSignal={resetSignal} />
            <div className="form-confirm"><Checkbox id="pedido-confirmacao" checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} /><label htmlFor="pedido-confirmacao">Autorizo o contato da equipe sobre este pedido e li a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label></div>
            <button className="rise-checkout-submit" type="submit" disabled={!pagamento || !turnstileToken || !confirmed || sending}>{sending ? <><LoaderCircle className="spinner" /> Salvando...</> : <>Registrar e continuar <Send /></>}</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
