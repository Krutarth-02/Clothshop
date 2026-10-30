import { Button, Checkbox, Divider, Group, Select, Slider, Stack, Text, TextInput, Title } from "@mantine/core";
import { RotateCcw, Search } from "lucide-react";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function ProductFilters({ values, options, priceLimit, disabled, onChange, onClear }) {
  return <Stack gap="lg">
    <Group justify="space-between"><Title order={2} size={19} fw={600}>Filters</Title><Text size="xs" c="dimmed">Refine your selection</Text></Group>
    <TextInput label="Search" placeholder="Find clothing..." value={values.q} disabled={disabled}
      onChange={(event) => onChange("q", event.currentTarget.value)} leftSection={<Search size={16} />} />
    {[
      { field: "category", label: "Category", data: options.categories },
      { field: "size", label: "Size", data: options.sizes },
      { field: "colour", label: "Colour", data: options.colours },
    ].map(({ field, label, data }) => <Select key={field} label={label} value={values[field]} searchable
      allowDeselect={false} disabled={disabled || !data.length}
      data={[{ value: "", label: "All" }, ...data.map((value) => ({ value, label: value }))]}
      onChange={(value) => onChange(field, value || "")} nothingFoundMessage="No matching options" />)}
    <Divider />
    <Stack gap="md">
      <Group justify="space-between"><Text size="sm" fw={500}>Max price</Text><Text size="sm" fw={600}>{money(values.maxPrice)}</Text></Group>
      <Slider aria-label="Maximum product price" min={0} max={priceLimit} step={1} value={values.maxPrice}
        onChange={(value) => onChange("maxPrice", value >= priceLimit ? "" : String(value))}
        disabled={disabled} color="gray" label={money} />
      <Group justify="space-between"><Text size="xs" c="dimmed">{money(0)}</Text><Text size="xs" c="dimmed">{money(priceLimit)}</Text></Group>
    </Stack>
    <Checkbox label="In stock only" checked={values.inStock} disabled={disabled}
      onChange={(event) => onChange("inStock", event.currentTarget.checked ? "true" : "")} color="dark" />
    <Button variant="default" fullWidth leftSection={<RotateCcw size={15} />} onClick={onClear}>Clear all</Button>
  </Stack>;
}
