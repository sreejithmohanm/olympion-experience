import CustomerAuthForm from '../../components/CustomerAuthForm';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const params = await searchParams;
  return <CustomerAuthForm mode="login" expired={params.expired === '1'} />;
}
