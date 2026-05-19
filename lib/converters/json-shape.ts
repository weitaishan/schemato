// 极简 JSON → "Shape" 推断器：把任意 JSON 推断成一个统一的字段树，
// 后面的 json-to-* 转换器都基于这个 Shape 输出。
// 不依赖外部库，构建期 / 浏览器都能跑。

export type ShapeKind =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "null"
  | "any"
  | "object"
  | "array"
  | "union";

export interface Shape {
  kind: ShapeKind;
  /** object 字段；只有 kind === 'object' 时有意义 */
  fields?: Record<string, { shape: Shape; optional: boolean }>;
  /** 数组元素 shape */
  items?: Shape;
  /** union 成员 */
  variants?: Shape[];
  /** 当 kind === 'object' 时，建议的类型名（PascalCase） */
  typeName?: string;
}

function isInteger(n: number) {
  return Number.isFinite(n) && Math.floor(n) === n;
}

function pascalCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") || "Root";
}

/** 合并两个 shape，得到能容纳两者的最小 shape（用于数组元素的合并/可选字段） */
function mergeShape(a: Shape, b: Shape): Shape {
  if (a.kind === b.kind) {
    if (a.kind === "object" && b.kind === "object") {
      const fields: Record<string, { shape: Shape; optional: boolean }> = {};
      const keys = new Set([...Object.keys(a.fields ?? {}), ...Object.keys(b.fields ?? {})]);
      for (const k of keys) {
        const af = a.fields?.[k];
        const bf = b.fields?.[k];
        if (af && bf) {
          fields[k] = { shape: mergeShape(af.shape, bf.shape), optional: af.optional || bf.optional };
        } else {
          const only = af ?? bf!;
          fields[k] = { shape: only.shape, optional: true };
        }
      }
      return { kind: "object", fields, typeName: a.typeName ?? b.typeName };
    }
    if (a.kind === "array" && b.kind === "array") {
      return { kind: "array", items: mergeShape(a.items ?? { kind: "any" }, b.items ?? { kind: "any" }) };
    }
    return a;
  }
  // null + X => X 可选（在调用处处理 optional）；这里返回 union
  if (a.kind === "null") return b;
  if (b.kind === "null") return a;
  // integer + number => number
  if ((a.kind === "integer" && b.kind === "number") || (a.kind === "number" && b.kind === "integer")) {
    return { kind: "number" };
  }
  return { kind: "union", variants: [a, b] };
}

export function inferShape(value: unknown, name = "Root"): Shape {
  if (value === null) return { kind: "null" };
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "boolean") return { kind: "boolean" };
  if (typeof value === "number") return { kind: isInteger(value) ? "integer" : "number" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", items: { kind: "any" } };
    let item = inferShape(value[0], name + "Item");
    for (let i = 1; i < value.length; i++) {
      item = mergeShape(item, inferShape(value[i], name + "Item"));
    }
    return { kind: "array", items: item };
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const fields: Record<string, { shape: Shape; optional: boolean }> = {};
    for (const [k, v] of Object.entries(obj)) {
      const child = inferShape(v, pascalCase(k));
      fields[k] = { shape: child, optional: v === null };
    }
    return { kind: "object", fields, typeName: pascalCase(name) };
  }
  return { kind: "any" };
}

/** 把对象 shape 树展开成"命名类型"列表（嵌套对象会被抽出） */
export interface NamedType {
  name: string;
  shape: Shape; // kind === 'object'
}

export function collectNamedTypes(root: Shape, rootName = "Root"): NamedType[] {
  const types: NamedType[] = [];
  const used = new Set<string>();

  function uniqueName(base: string): string {
    let name = base;
    let i = 2;
    while (used.has(name)) name = `${base}${i++}`;
    used.add(name);
    return name;
  }

  function walk(shape: Shape, hint: string): Shape {
    if (shape.kind === "object") {
      const name = uniqueName(shape.typeName ?? pascalCase(hint));
      const newFields: Record<string, { shape: Shape; optional: boolean }> = {};
      for (const [k, f] of Object.entries(shape.fields ?? {})) {
        newFields[k] = { shape: walk(f.shape, k), optional: f.optional };
      }
      const replaced: Shape = { kind: "object", fields: newFields, typeName: name };
      types.push({ name, shape: replaced });
      // 用一个"引用占位"代替原来的对象 — 这里用 typeName 表示引用
      return { kind: "object", typeName: name };
    }
    if (shape.kind === "array") {
      return { kind: "array", items: walk(shape.items ?? { kind: "any" }, hint + "Item") };
    }
    return shape;
  }

  walk({ ...root, typeName: pascalCase(rootName) }, rootName);
  // 反转：让最内层的类型先定义，外层后定义（友好顺序）
  return types.reverse();
}

export function parseJsonSafe(input: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
