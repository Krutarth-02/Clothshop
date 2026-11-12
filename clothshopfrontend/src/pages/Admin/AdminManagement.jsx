import { useState } from "react";
import { useFormik } from "formik";
import { useDebouncedValue } from "@mantine/hooks";
import { Badge, Box, Button, Divider, Group, Image, Loader, NumberInput, Pagination, Paper, PasswordInput, Select, SimpleGrid, Stack, Table, Text, Textarea, TextInput, Title, ActionIcon } from "@mantine/core";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Search, Trash2, Eye } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDeleteAdminDataMutation, useGetAdminDataQuery, useSaveAdminDataMutation } from "../../redux/admin/adminApi";
import CommonModal from "../../components/common/Modal";
import ErrorAlert from "../../components/common/ErrorAlert";
import ActionMenu from "../../components/common/ActionMenu";
import { productOptions } from "../../components/product/productOptions";

const money = amount => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
const statuses = ["confirmed", "processing", "shipped", "delivered"];
const activityLabels = { POST: "Created", PUT: "Updated", DELETE: "Deleted", USER_SIGNED_IN: "Customer signed in", ACCOUNT_CREATED: "Customer registered", ORDER_PLACED: "Order placed" };

function RecordForm({ resource, staff, record, admin, onClose }) {
  const product = resource === "products", order = resource === "orders";
  const [save, { isLoading }] = useSaveAdminDataMutation();
  const formik = useFormik({
    initialValues: product ? {
      name: record?.name || "", description: record?.description || "", category: record?.category || "", image: record?.image || "",
      price: record?.price ?? 0, stock: record?.stock ?? 0, color: productOptions(record?.color).join(", "), size: productOptions(record?.size).join(", "),
      colorImages: (record?.colorImages || []).map(item => ({ color: item.color, images: item.images.join("\n") })),
      sizeChart: (record?.sizeChart || []).map(item => ({ size: item.size, chestCm: item.chestCm })),
    } : order ? { fulfillmentStatus: record.fulfillmentStatus || "confirmed" } : {
      fullName: record?.fullName || "", email: record?.email || "", phone: record?.phone || "", city: record?.city || "", country: record?.country || "", role: record?.role || (staff ? "admin" : "user"), password: "",
    },
    validate: values => {
      const errors = {};
      if (order) return errors;
      for (const field of product ? ["name", "description"] : ["fullName", "email"]) if (!values[field].trim()) errors[field] = "This field is required.";
      if (!product && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email.";
      if (!product && (!record || values.password) && values.password.length < 12) errors.password = "Use at least 12 characters.";
      if (product && (typeof values.price !== "number" || values.price < 0)) errors.price = "Enter a valid price.";
      if (product && (!Number.isSafeInteger(values.stock) || values.stock < 0)) errors.stock = "Enter a whole number of units.";
      return errors;
    },
    onSubmit: async values => {
      try {
        const body = product ? {
          ...values, color: values.color.split(",").map(value => value.trim()).filter(Boolean), size: values.size.split(",").map(value => value.trim()).filter(Boolean),
          colorImages: values.colorImages.map(item => ({ color: item.color, images: item.images.split(/\r?\n/).map(value => value.trim()).filter(Boolean) })),
        } : order ? { fulfillmentStatus: values.fulfillmentStatus } : { ...values, password: values.password || undefined };
        await save({ resource, id: record?._id, body }).unwrap();
        toast.success("Changes saved"); onClose();
      } catch (error) { formik.setStatus(error?.data?.message || "Unable to save. Please retry."); }
    },
  });
  const field = name => ({ name, value: formik.values[name], onChange: formik.handleChange, onBlur: formik.handleBlur, error: (formik.touched[name] || formik.submitCount > 0) && formik.errors[name] });
  const numeric = name => ({ value: formik.values[name], onChange: value => formik.setFieldValue(name, value), error: formik.errors[name] });
  const title = product ? "product" : order ? "order" : staff ? "administrator" : "customer";
  return <CommonModal title={`${record ? "Edit" : "Add"} ${title}`} size={product || order ? "lg" : "md"} onClose={onClose} onSubmit={formik.handleSubmit} busy={isLoading} error={formik.status}
    actions={[{ label: "Cancel", variant: "default", onClick: onClose }, { label: "Save changes", type: "submit", loading: isLoading, color: "blue" }]}>
    <Stack gap="md">{product ? <>
      <TextInput label="Product name" required maxLength={200} {...field("name")} />
      <Textarea label="Description" autosize minRows={3} maxRows={8} required maxLength={5000} {...field("description")} />
      <SimpleGrid cols={2}><NumberInput label="Price (INR)" min={0} max={100000000} decimalScale={2} required {...numeric("price")} /><NumberInput label="Stock" min={0} max={100000000} allowDecimal={false} required {...numeric("stock")} /></SimpleGrid>
      <TextInput label="Category" placeholder="women, men or accessories" {...field("category")} />
      <TextInput label="Main photo URL" placeholder="https://..." type="url" maxLength={2000} {...field("image")} />
      <SimpleGrid cols={2}><TextInput label="Colours" description="Comma separated, e.g. White, Black" {...field("color")} /><TextInput label="Sizes" description="Comma separated, e.g. S, M, L" {...field("size")} /></SimpleGrid>
      <Divider label="Colour photos" /><Text size="xs" c="dimmed">Use an available colour name and one image URL per line.</Text>
      {formik.values.colorImages.map((item, index) => <Group key={index} align="start" wrap="nowrap"><Stack gap="xs" style={{ flex: 1 }}>
        <TextInput aria-label={`Photo colour ${index + 1}`} placeholder="Colour name" value={item.color} onChange={event => formik.setFieldValue(`colorImages.${index}.color`, event.currentTarget.value)} />
        <Textarea aria-label={`Photo URLs ${index + 1}`} placeholder="https://..." value={item.images} onChange={event => formik.setFieldValue(`colorImages.${index}.images`, event.currentTarget.value)} />
      </Stack><ActionIcon variant="subtle" color="red" aria-label="Remove colour photos" onClick={() => formik.setFieldValue("colorImages", formik.values.colorImages.filter((_, position) => position !== index))}><Trash2 size={17} /></ActionIcon></Group>)}
      <Button variant="light" leftSection={<Plus size={15} />} onClick={() => formik.setFieldValue("colorImages", [...formik.values.colorImages, { color: "", images: "" }])}>Add colour photos</Button>
      <Divider label="Size measurements" />
      {formik.values.sizeChart.map((item, index) => <Group key={index} wrap="nowrap" align="end"><TextInput label="Size" value={item.size} style={{ flex: 1 }} onChange={event => formik.setFieldValue(`sizeChart.${index}.size`, event.currentTarget.value)} />
        <NumberInput label="Chest (cm)" min={1} max={1000} value={item.chestCm} style={{ flex: 1 }} onChange={value => formik.setFieldValue(`sizeChart.${index}.chestCm`, value)} />
        <ActionIcon variant="subtle" color="red" mb={4} aria-label="Remove size" onClick={() => formik.setFieldValue("sizeChart", formik.values.sizeChart.filter((_, position) => position !== index))}><Trash2 size={17} /></ActionIcon></Group>)}
      <Button variant="light" leftSection={<Plus size={15} />} onClick={() => formik.setFieldValue("sizeChart", [...formik.values.sizeChart, { size: "", chestCm: 90 }])}>Add size measurement</Button>
    </> : order ? <>
      <Group justify="space-between"><Text fw={600}>#{record._id.slice(-8).toUpperCase()}</Text><Badge variant="light">{record.status}</Badge></Group>
      <Text size="sm">{new Date(record.createdAt).toLocaleString("en-IN")} · {money(record.totalAmount)}</Text>
      <Select label="Fulfillment status" allowDeselect={false} value={formik.values.fulfillmentStatus} onChange={value => formik.setFieldValue("fulfillmentStatus", value)}
        data={statuses.map(value => ({ value, label: value[0].toUpperCase() + value.slice(1), disabled: statuses.indexOf(value) < statuses.indexOf(record.fulfillmentStatus || "confirmed") }))} />
      <Divider label="Delivery" /><Text size="sm" fw={600}>{record.shippingAddress?.fullName}</Text><Text size="sm">{Object.entries(record.shippingAddress || {}).filter(([key]) => !["fullName", "_id"].includes(key)).map(([, value]) => value).join(", ")}</Text>
      <Divider label="Items" />{(record.items || []).map((item, index) => <Group key={index} justify="space-between"><Box><Text size="sm">{item.name}</Text><Text size="xs" c="dimmed">{[item.color, item.size].filter(Boolean).join(" / ")} · Qty {item.quantity}</Text></Box><Text size="sm">{money(item.lineTotal)}</Text></Group>)}
      <Text size="xs" c="dimmed">Fulfillment changes do not modify payment totals or mark COD payments as paid.</Text>
    </> : <>
      <TextInput label="Full name" required maxLength={200} {...field("fullName")} /><TextInput label="Email" type="email" autoComplete="off" required maxLength={200} {...field("email")} />
      <TextInput label="Phone" {...field("phone")} /><SimpleGrid cols={2}><TextInput label="City" {...field("city")} /><TextInput label="Country" {...field("country")} /></SimpleGrid>
      {admin.role === "superadmin" && <Select label="Account role" value={formik.values.role} disabled={record?.role === "superadmin"} allowDeselect={false}
        data={record?.role === "superadmin" ? [{ value: "superadmin", label: "Store owner" }] : [{ value: "user", label: "Customer" }, { value: "admin", label: "Administrator" }]}
        onChange={value => formik.setFieldValue("role", value)} />}
      <PasswordInput label={record ? "New password (optional)" : "Password"} description={record ? "Leave blank to keep the current password." : "Use at least 12 characters."} autoComplete="new-password" required={!record} {...field("password")} />
    </>}</Stack>
  </CommonModal>;
}

export default function AdminManagement({ resource, staff = false }) {
  const { admin } = useOutletContext();
  const product = resource === "products", order = resource === "orders", activity = resource === "activity";
  const allowed = !staff || admin.role === "superadmin";
  const title = staff ? "Administrators" : product ? "Products" : order ? "Orders" : activity ? "Activity log" : "Customers";
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = (searchParams.get("search") || "").slice(0, 100);
  const setPage = nextPage => setSearchParams(previous => {
    const params = new URLSearchParams(previous);
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    return params;
  }, { replace: true });
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [editing, setEditing] = useState(null), [creating, setCreating] = useState(false), [deleting, setDeleting] = useState(null);
  const { data, error, isLoading, isFetching, refetch } = useGetAdminDataQuery({ resource, page, search: debouncedSearch, staff }, { skip: !allowed, refetchOnMountOrArgChange: true, pollingInterval: activity ? 30000 : 0 });
  const [remove, { isLoading: removing, error: deleteError }] = useDeleteAdminDataMutation();
  const rows = data?.data || [];
  const closeEditor = () => { setEditing(null); setCreating(false); };
  async function deleteRecord() {
    try {
      await remove({ resource, id: deleting._id }).unwrap(); setDeleting(null);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      toast.success("Record deleted");
    } catch { /* The confirmation displays the error. */ }
  }
  if (!allowed) return <ErrorAlert title="Owner access required" message="Only a store owner can manage administrators." />;
  return <Stack gap="xl"><Group justify="space-between"><Box><Text size="xs" c="dimmed" mb={5}>WORKSPACE / {title.toUpperCase()}</Text><Title order={1} size={27} fw={600}>{title}</Title>
    <Text size="sm" c="dimmed" mt={6}>{activity ? "Account events, purchase activity and admin operations." : order ? "Review purchases and manage fulfillment." : staff ? "Manage the people who run your store." : "Search, review and manage your store records."}</Text></Box>
    {!order && !activity && <Button leftSection={<Plus size={16} />} onClick={() => setCreating(true)}>Add {product ? "product" : staff ? "admin" : "customer"}</Button>}
  </Group><Paper withBorder radius="md" p="lg">
    <Group justify="space-between" mb="lg">{!activity ? <TextInput placeholder={order ? "Search recipient name..." : `Search ${title.toLowerCase()}...`} aria-label={`Search ${title}`} leftSection={<Search size={16} />} value={search} maxLength={100} onChange={event => { const value = event.currentTarget.value; setSearchParams(value ? { search: value } : {}, { replace: true }); }} style={{ flex: 1, maxWidth: 380 }} /> : <Text size="sm" c="dimmed">Most recent events first</Text>}
      <Group gap="sm">{isFetching && <Loader size="xs" />}<Button variant="default" size="xs" leftSection={<RefreshCw size={14} />} onClick={refetch}>Refresh</Button></Group>
    </Group>
    {error ? <ErrorAlert title="Records could not load" message={error?.data?.message || "Please retry."} onRetry={refetch} /> : <>
      <Table.ScrollContainer minWidth={650}><Table highlightOnHover verticalSpacing="md"><Table.Thead><Table.Tr>
        <Table.Th>{product ? "Product" : order ? "Order / customer" : activity ? "Actor" : "Name"}</Table.Th><Table.Th>{product ? "Price" : order ? "Amount" : activity ? "Action" : "Email"}</Table.Th><Table.Th>{product ? "Stock" : order ? "Fulfillment" : activity ? "When" : "Role"}</Table.Th><Table.Th style={{ textAlign: "right" }}>{activity ? "Result" : "Actions"}</Table.Th>
      </Table.Tr></Table.Thead><Table.Tbody>{rows.map(record => <Table.Tr key={record._id}>
        <Table.Td>{product ? <Group wrap="nowrap" gap="sm"><Image src={record.image || null} alt="" w={40} h={50} radius="sm" /><Box><Text size="sm" fw={500}>{record.name}</Text><Text size="xs" c="dimmed">{record.category || "Uncategorized"}</Text></Box></Group>
          : order ? <Box><Text size="sm" fw={500}>#{record._id.slice(-8).toUpperCase()}</Text><Text size="xs" c="dimmed">{record.shippingAddress?.fullName || "Customer"}</Text></Box>
          : <Text size="sm" fw={500}>{activity ? record.userId?.fullName || "Visitor / former account" : record.fullName}</Text>}</Table.Td>
        <Table.Td>{product ? money(record.price) : order ? <Box><Text size="sm">{money(record.totalAmount)}</Text><Text size="xs" c="dimmed">{record.status}</Text></Box> : activity ? <Box><Text size="sm">{record.resource === "/login" ? record.status < 400 ? "Admin signed in" : "Admin sign-in failed" : activityLabels[record.action] || record.action}</Text><Text size="xs" c="dimmed">{record.resource}{record.recordId ? ` · ${record.recordId.slice(-8)}` : ""}</Text></Box> : <Text size="sm">{record.email}</Text>}</Table.Td>
        <Table.Td>{product ? <Badge color={record.stock > 5 ? "teal" : record.stock ? "orange" : "red"} variant="light">{record.stock || 0} units</Badge> : order ? <Badge variant="light">{record.fulfillmentStatus || "confirmed"}</Badge> : activity ? <Text size="xs" c="dimmed">{new Date(record.createdAt).toLocaleString("en-IN")}</Text> : <Badge variant="light" color={record.role === "user" ? "gray" : "blue"}>{record.role === "superadmin" ? "Owner" : record.role}</Badge>}</Table.Td>
        <Table.Td>{activity ? <Group justify="flex-end"><Badge variant="light" color={record.status >= 400 ? "red" : "teal"}>{record.status >= 400 ? "Failed" : "Success"}</Badge></Group> : <Group justify="flex-end"><ActionMenu width={170} items={[
          { label: order ? "View order" : "Edit record", icon: order ? <Eye size={16} /> : <Pencil size={16} />, action: () => setEditing(record) },
          ...(!order ? [{ label: "Delete", icon: <Trash2 size={16} />, danger: true, disabled: record.role === "superadmin" || record._id === admin._id, action: () => setDeleting(record) }] : []),
        ]} target={<ActionIcon variant="subtle" color="gray" aria-label="Record actions"><MoreHorizontal size={19} /></ActionIcon>} /></Group>}</Table.Td>
      </Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer>
      {!rows.length && <Stack align="center" py={50}>{isLoading ? <Loader /> : <><Text fw={500}>No {title.toLowerCase()} found</Text><Text size="sm" c="dimmed">{search ? "Try a different search." : "New records will appear here."}</Text></>}</Stack>}
      <Group justify="space-between" mt="xl"><Text size="xs" c="dimmed">{data?.total || 0} records</Text><Pagination value={page} onChange={setPage} total={Math.max(1, Math.ceil((data?.total || 0) / 15))} size="sm" /></Group>
    </>}
  </Paper>
  {(editing || creating) && <RecordForm key={editing?._id || "new"} resource={resource} staff={staff} record={editing} admin={admin} onClose={closeEditor} />}
  {deleting && <CommonModal title="Delete this record?" onClose={() => setDeleting(null)} busy={removing} error={deleteError?.data?.message}
    actions={[{ label: "Cancel", variant: "default", onClick: () => setDeleting(null) }, { label: "Delete", color: "red", loading: removing, onClick: deleteRecord }]}>
    <Text size="sm">Delete <Text component="span" fw={600}>{deleting.name || deleting.fullName}</Text>? This is permanent. Existing purchase history will be retained.</Text>
  </CommonModal>}
  </Stack>;
}
