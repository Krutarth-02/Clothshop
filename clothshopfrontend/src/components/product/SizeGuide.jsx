import { useState } from "react";
import { Alert, Anchor, Button, Group, NumberInput, Select, Stack, Table, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { Ruler } from "lucide-react";
import CommonModal from "../common/Modal";
import { getSizeChart, suggestSize } from "./sizeRecommendation";

const number = (value) => Number(value.toFixed(1)).toString();

export default function SizeGuide({ product, onSelect }) {
  const [opened, setOpened] = useState(false);
  const [unit, setUnit] = useState("cm");
  const [chest, setChest] = useState("");
  const [fit, setFit] = useState("regular");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { rows, sample } = getSizeChart(product);
  const clearResult = () => { setResult(null); setError(""); };
  const submit = (event) => {
    event.preventDefault();
    const suggestion = suggestSize(rows, typeof chest === "number" ? chest : NaN, unit, fit);
    if (!suggestion) { setResult(null); setError("Enter a chest measurement greater than zero."); return; }
    setError("");
    setResult(suggestion);
  };
  const display = (cm) => number(unit === "in" ? cm / 2.54 : cm);

  return <>
    <Group gap="sm">
      <Anchor component={Link} to="/size-guide" size="xs" c="dimmed">Size guide</Anchor>
      <Button variant="default" size="compact-sm" leftSection={<Ruler size={16} />} onClick={() => setOpened(true)} aria-haspopup="dialog">Find my size</Button>
    </Group>
    <CommonModal opened={opened} onClose={() => setOpened(false)} title={`Size guide · ${product.category || product.name}`} size={700} radius="lg" padding="lg"
      styles={{ title: { fontWeight: 700, fontSize: "clamp(24px, 4vw, 32px)", lineHeight: 1.2 }, header: { paddingBottom: 18 }, body: { paddingTop: 0 }, content: { maxHeight: "calc(100dvh - 32px)" } }}>
      <Stack gap="lg">
        {!rows.length ? <Alert color="gray" title="Measurement chart not available">This product doesn't have a chest measurement chart. Use the listed sizes and our <a href="/size-guide">size &amp; fit guide</a> before choosing.</Alert> : <>
          <Alert color="gray">{sample ? "Sample chart only; these are not verified measurements for this product. " : "Product chart shows the finished garment chest circumference. "}Measure around the fullest part of your chest, keeping the tape level. Enter your body measurement, not a garment measurement.</Alert>
          <Group gap="xs" wrap="nowrap"><Text fw={500}>Unit</Text><Select aria-label="Measurement unit" value={unit} data={[{ value: "cm", label: "cm" }, { value: "in", label: "in" }]} allowDeselect={false} w={85} onChange={(next) => {
            if (!next || next === unit) return;
            setChest(typeof chest === "number" ? Number((next === "in" ? chest / 2.54 : chest * 2.54).toFixed(4)) : "");
            setUnit(next); clearResult();
          }} /></Group>
          <Table withRowBorders verticalSpacing="sm">
            <Table.Thead><Table.Tr><Table.Th>Size</Table.Th><Table.Th>Garment chest ({unit})</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>{rows.map((row) => <Table.Tr key={row.size} bg={result?.match?.size === row.size ? "var(--mantine-color-default-hover)" : undefined}><Table.Td fw={result?.match?.size === row.size ? 700 : 400}>{row.size}</Table.Td><Table.Td>{display(row.chestCm)}</Table.Td></Table.Tr>)}</Table.Tbody>
          </Table>
          <form onSubmit={submit}>
            <Stack gap="md">
              <Text fw={700} size="xl">Find my size</Text>
              <NumberInput label={`Chest (${unit})`} size="md" value={chest} onChange={(value) => { setChest(value); clearResult(); }} min={0} allowNegative={false} decimalScale={2} error={error} />
              <Select label="Preferred fit" size="md" value={fit} allowDeselect={false} data={[{ value: "slim", label: "Slim" }, { value: "regular", label: "Regular" }, { value: "relaxed", label: "Relaxed" }]} onChange={(value) => { if (value) setFit(value); clearResult(); }} />
              <Button type="submit" color="dark" size="md" mt="sm" style={{ alignSelf: "flex-start" }}>Suggest size</Button>
              <div aria-live="polite" aria-atomic="true">
                {result && (result.match ? <Alert color={sample ? "gray" : "teal"} title={`${sample ? "Estimated size" : "Suggested size"}: ${result.match.size}`}>
                  Your {display(result.bodyCm)} {unit} + {display(result.ease)} {unit} ease = {display(result.target)} {unit}; size {result.match.size} measures {display(result.match.chestCm)} {unit}.
                  <Button mt="sm" variant="default" size="xs" onClick={() => { onSelect(result.match.size); setOpened(false); }}>Use size {result.match.size}</Button>
                </Alert> : <Alert color="orange" title="No suitable listed size">Your chest plus fit allowance is {display(result.target)} {unit}, which exceeds this chart. Try another product rather than choosing a size that may be too small.</Alert>)}
              </div>
              <Text size="xs" c="dimmed">Estimate only, not a guarantee of fit. Allowance: Slim 4 cm, Regular 8 cm, Relaxed 12 cm. Fabric stretch, cut and personal preference can affect fit.{sample ? " Confirm actual garment measurements before purchasing." : ""}</Text>
            </Stack>
          </form>
        </>}
        <Group justify="flex-start"><Button variant="default" size="md" onClick={() => setOpened(false)}>Close</Button></Group>
      </Stack>
    </CommonModal>
  </>;
}
