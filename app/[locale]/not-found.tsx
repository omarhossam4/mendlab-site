import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * Locale-scoped 404. Kept locale-agnostic (bilingual copy) since it can render
 * for unknown segments where the active locale isn't guaranteed.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-text-dark">
        Page not found · الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-md text-text-dark/70">
        The page you’re looking for doesn’t exist or has moved.
        <br />
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/en">Home</Button>
        <Button href="/ar" variant="outline">
          الرئيسية
        </Button>
      </div>
      <Link
        href="/en/contact"
        className="mt-6 text-sm font-medium text-accent hover:text-primary"
      >
        Contact us · تواصل معنا
      </Link>
    </Container>
  );
}
