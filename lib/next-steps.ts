// 每个目标语言/库的"下一步"建议
// 让用户拿到生成的代码后，知道怎么用到自己的工程里。
// 这是 SEO + UX 双赢：增加页面停留时长 + 命中"how to use X with Y"长尾词

import type { FormatId } from "./formats";

export interface NextStep {
  /** 显示标题 */
  title: string;
  /** 一段说明 */
  body: string;
  /** 配套的代码片段（可选） */
  code?: { lang: string; src: string };
}

const NEXT_BY_TARGET: Partial<Record<FormatId, NextStep[]>> = {
  zod: [
    {
      title: "Validate fetch responses",
      body:
        "Use the schema as a runtime guard at your API boundary. If the response shape ever drifts, you fail loudly instead of silently.",
      code: {
        lang: "ts",
        src: `const data = User.parse(await fetch("/api/me").then(r => r.json()));`,
      },
    },
    {
      title: "Hook into React Hook Form",
      body:
        "Pair with @hookform/resolvers/zod to turn the schema into a form validator with field-level error messages.",
      code: {
        lang: "ts",
        src: `import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({ resolver: zodResolver(User) });`,
      },
    },
    {
      title: "Re-export inferred type",
      body: "If you also want a static TypeScript type, infer it from the schema so they can never drift apart.",
      code: { lang: "ts", src: `export type User = z.infer<typeof User>;` },
    },
  ],
  yup: [
    {
      title: "Use with Formik or React Hook Form",
      body:
        "Both libraries have first-class Yup support. Wire the schema directly into the form configuration.",
      code: {
        lang: "ts",
        src: `<Formik validationSchema={userSchema} ... />`,
      },
    },
    {
      title: "Validate at the route boundary",
      body:
        "On the server, call schema.validate(input) inside your handler to reject malformed payloads early.",
    },
  ],
  joi: [
    {
      title: "Plug into Express middleware",
      body:
        "Pair with celebrate or a 5-line middleware to validate body / params / query before handlers run.",
      code: {
        lang: "js",
        src: `app.post("/users", (req, res, next) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  // value is now typed and trusted
});`,
      },
    },
    {
      title: "Customize error messages",
      body:
        "Use .messages({ ... }) on individual fields to return human-friendly errors that match your UI copy.",
    },
  ],
  pydantic: [
    {
      title: "Use directly in FastAPI",
      body:
        "Pass the model as a function parameter — FastAPI parses JSON, validates, and gives you a typed object automatically.",
      code: {
        lang: "py",
        src: `@app.post("/users")
async def create_user(user: User):
    return {"id": user.id, "name": user.name}`,
      },
    },
    {
      title: "Round-trip JSON",
      body:
        "Use .model_dump_json() to serialize and User.model_validate_json(s) to parse — no third-party JSON library needed.",
    },
    {
      title: "Make a field strict",
      body:
        "By default Pydantic coerces (e.g. '1' → 1). Use Field(..., strict=True) on a field, or model_config = ConfigDict(strict=True) on the class.",
    },
  ],
  "python-dataclass": [
    {
      title: "Pair with dacite or pydantic.TypeAdapter",
      body:
        "Stdlib dataclasses don't validate. Use a small library like `dacite` to deserialize JSON into the dataclass with type checks.",
    },
    {
      title: "Use with FastAPI as response model",
      body:
        "FastAPI accepts dataclasses as response_model. Returns serialized cleanly without you converting manually.",
    },
  ],
  typescript: [
    {
      title: "Use as a tRPC procedure input",
      body:
        "Pair with z.input or the type directly to enforce client/server contract.",
    },
    {
      title: "Generate documentation",
      body:
        "Drop the interface into TypeDoc or just rely on your IDE — the IntelliSense alone usually replaces a docs page.",
    },
  ],
  "go-struct": [
    {
      title: "Decode JSON requests",
      body:
        "json.NewDecoder(r.Body).Decode(&user) gives you a typed Go value with no extra dependencies.",
      code: {
        lang: "go",
        src: `var user User
if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
    http.Error(w, "bad json", 400)
    return
}`,
      },
    },
    {
      title: "Validate with go-playground/validator",
      body:
        "Add `validate:\"required\"` tags next to the json tags to plug in the most popular Go validation library.",
    },
  ],
  "rust-struct": [
    {
      title: "Deserialize with serde_json",
      body: "One line gets you a typed Rust value — and any mismatch becomes a Result::Err you can match on.",
      code: {
        lang: "rust",
        src: `let user: User = serde_json::from_str(json_str)?;`,
      },
    },
    {
      title: "Use with axum or actix",
      body:
        "Both web frameworks integrate with serde — accept the struct as a handler parameter and the framework deserializes automatically.",
    },
  ],
  swift: [
    {
      title: "Decode in one line",
      body:
        "Codable + JSONDecoder is the canonical iOS pattern.",
      code: {
        lang: "swift",
        src: `let user = try JSONDecoder().decode(User.self, from: data)`,
      },
    },
    {
      title: "Customize key mapping",
      body:
        "Set decoder.keyDecodingStrategy = .convertFromSnakeCase if your API uses snake_case keys but you want camelCase Swift fields.",
    },
  ],
  kotlin: [
    {
      title: "Pair with kotlinx.serialization",
      body:
        "Add @Serializable to the class, and Json.decodeFromString<User>(jsonString) gives you a typed instance.",
    },
    {
      title: "Use with Retrofit + Moshi",
      body:
        "If you're on Android, Moshi will reflectively bind JSON keys to your data class fields with no extra work.",
    },
  ],
  java: [
    {
      title: "Bind with Jackson",
      body:
        "objectMapper.readValue(json, User.class) — Jackson handles record types out of the box in modern versions.",
    },
    {
      title: "Use with Spring Boot",
      body:
        "Records work as @RequestBody parameters and as response bodies without extra configuration.",
    },
  ],
  csharp: [
    {
      title: "Use System.Text.Json",
      body:
        "JsonSerializer.Deserialize<User>(json) handles records out of the box (since .NET 5+).",
    },
    {
      title: "Wire into ASP.NET Core",
      body:
        "Records work as parameters in [HttpPost] handlers; the framework deserializes automatically.",
    },
  ],
  dart: [
    {
      title: "Use with json_serializable",
      body:
        "Add @JsonSerializable() and run the build_runner to get fromJson/toJson generated for free.",
    },
    {
      title: "Plug into Flutter networking",
      body:
        "Wire the model into your http / dio repository layer for typed API responses.",
    },
  ],
  php: [
    {
      title: "Use Symfony Serializer",
      body:
        "$serializer->deserialize($json, User::class, 'json') gives you a typed instance.",
    },
    {
      title: "Use with Laravel resources",
      body:
        "Wrap in an API Resource class to control how the model is serialized in HTTP responses.",
    },
  ],
  ruby: [
    {
      title: "Add dry-struct for validation",
      body:
        "Plain Ruby classes don't validate; dry-struct gives you typed initializers and clearer errors.",
    },
    {
      title: "Use in Rails controllers",
      body:
        "Initialize from params after strong-parameters filtering — keeps controller code readable.",
    },
  ],
};

export function nextStepsFor(target: FormatId): NextStep[] {
  return NEXT_BY_TARGET[target] ?? [];
}
