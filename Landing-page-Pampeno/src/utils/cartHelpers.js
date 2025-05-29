export function buildWhatsappMessage(cart) {
  if (cart.length === 0) return "";
  let msg = "¡Hola! Quiero pedir estos productos:%0A";
  cart.forEach((item, idx) => {
    msg += `• ${item.name} x${item.qty} - Bs. ${item.price} (Stock: ${item.stock})%0A`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  msg += `%0ATotal: Bs. ${total}`;
  return msg;
}