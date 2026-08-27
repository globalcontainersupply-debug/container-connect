import { createFileRoute } from "@tanstack/react-router";
import { ProductEditor } from "@/components/admin/product-editor";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  ssr: false,
  component: ProductEditorRoute,
});

function ProductEditorRoute() {
  const { id } = Route.useParams();
  return <ProductEditor id={id} />;
}
