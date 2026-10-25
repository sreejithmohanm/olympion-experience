import MarketplaceAuthGuard from '../../components/MarketplaceAuthGuard';

export default function MarketplaceLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MarketplaceAuthGuard>{children}</MarketplaceAuthGuard>;
}
