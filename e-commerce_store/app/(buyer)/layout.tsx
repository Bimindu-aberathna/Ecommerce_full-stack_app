import CustomerNavbar from "@/src/components/buyer/navbar/navbar";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomerNavbar />
      {children}
    </>
  );
}
