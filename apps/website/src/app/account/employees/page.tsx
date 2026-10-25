import CustomerEmployees from '../../../components/CustomerEmployees';
import MarketplaceAuthGuard from '../../../components/MarketplaceAuthGuard';

export default function CustomerEmployeesPage() {
  return (
    <MarketplaceAuthGuard>
      <CustomerEmployees />
    </MarketplaceAuthGuard>
  );
}
