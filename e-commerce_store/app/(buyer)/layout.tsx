import CustomerNavbar from "@/src/components/buyer/navbar/CustomerNavbar";



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
