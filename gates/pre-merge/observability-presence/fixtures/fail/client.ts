export async function fetchOrder(id: string) {
  return await fetch(`https://orders.internal/v1/${id}`);
}
