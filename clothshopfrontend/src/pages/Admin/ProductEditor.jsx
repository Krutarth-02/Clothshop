import { useFormik } from "formik";
import {
  Alert,
  Autocomplete,
  Button,
  Drawer,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSaveAdminProductMutation } from "../../redux/admin/adminApi";
import { productOptions } from "../../components/product/productOptions";

export default function ProductEditor({ product, categories, onClose }) {
  const [saveProduct, { isLoading }] = useSaveAdminProductMutation();
  const [error, setError] = useState("");
  const editing = Boolean(product._id);
  const form = useFormik({
    initialValues: {
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? 0,
      image: product.image || "",
      color: productOptions(product.color),
      size: productOptions(product.size),
    },
    validate: (values) => {
      const errors = {};
      if (!values.name.trim()) errors.name = "Enter a product name";
      if (!values.description.trim())
        errors.description = "Enter a description";
      if (!values.category.trim()) errors.category = "Enter a category";
      if (
        typeof values.price !== "number" ||
        !Number.isFinite(values.price) ||
        values.price < 0
      )
        errors.price = "Enter a non-negative price";
      if (!Number.isSafeInteger(values.stock) || values.stock < 0)
        errors.stock = "Enter a non-negative whole number";
      if (values.image.trim()) {
        try {
          if (
            !["http:", "https:"].includes(new URL(values.image.trim()).protocol)
          )
            throw new Error();
        } catch {
          errors.image = "Enter an http:// or https:// image URL";
        }
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (isLoading) return;
      setError("");
      try {
        const result = await saveProduct({
          ...values,
          ...(editing ? { id: product._id } : {}),
        }).unwrap();
        toast.success(result.message);
        onClose();
      } catch (failure) {
        setError(
          failure?.data?.message ||
            "Unable to save this product. Please try again.",
        );
      }
    },
  });
  const field = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.touched[name] && form.errors[name],
    disabled: isLoading,
  });
  return (
    <Drawer
      opened
      onClose={() => !isLoading && onClose()}
      position="right"
      title={editing ? "Edit product" : "Add a product"}
      size="min(38rem, 100vw)"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      closeButtonProps={{
        disabled: isLoading,
        "aria-label": "Close product editor",
      }}
      padding="xl"
    >
      <Text size="sm" c="dimmed" mb="xl">
        Changes appear in the storefront after saving. Stock is shared across
        this product's colours and sizes.
      </Text>
      <form onSubmit={form.handleSubmit}>
        <Stack gap="lg">
          {error && (
            <Alert color="red" role="alert">
              {error}
            </Alert>
          )}
          <TextInput
            label="Product name"
            required
            maxLength={200}
            {...field("name")}
          />
          <Textarea
            label="Description"
            required
            autosize
            minRows={4}
            maxLength={10000}
            {...field("description")}
          />
          <Autocomplete
            label="Category"
            required
            data={categories}
            maxLength={100}
            value={form.values.category}
            disabled={isLoading}
            onChange={(value) => form.setFieldValue("category", value)}
            onBlur={() => form.setFieldTouched("category")}
            error={form.touched.category && form.errors.category}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <NumberInput
              label="Price (INR)"
              required
              min={0}
              decimalScale={2}
              value={form.values.price}
              disabled={isLoading}
              onChange={(value) => form.setFieldValue("price", value)}
              onBlur={() => form.setFieldTouched("price")}
              error={form.touched.price && form.errors.price}
            />
            <NumberInput
              label="Stock available"
              required
              min={0}
              allowDecimal={false}
              value={form.values.stock}
              disabled={isLoading}
              onChange={(value) => form.setFieldValue("stock", value)}
              onBlur={() => form.setFieldTouched("stock")}
              error={form.touched.stock && form.errors.stock}
            />
          </SimpleGrid>
          <TextInput
            label="Image URL"
            description="Use a publicly accessible product image."
            maxLength={2048}
            {...field("image")}
          />
          <TagsInput
            label="Colours"
            description="Press Enter after each colour. You can also use hex codes."
            value={form.values.color}
            maxTags={50}
            disabled={isLoading}
            onChange={(value) => form.setFieldValue("color", value)}
          />
          <TagsInput
            label="Sizes"
            description="For example: S, M, L, XL. Leave blank for one size."
            value={form.values.size}
            maxTags={50}
            disabled={isLoading}
            onChange={(value) => form.setFieldValue("size", value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" color="dark" loading={isLoading}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
