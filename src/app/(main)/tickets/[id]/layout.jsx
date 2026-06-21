export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tickets/${id}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || "Ticket Details",
        description: `Book tickets for ${data.title || "this commute"} on TicketBari.`,
      };
    }
  } catch (err) {
    console.error("Error generating dynamic ticket metadata:", err);
  }
  return {
    title: "Ticket Details",
  };
}

export default function TicketDetailsLayout({ children }) {
  return children;
}
