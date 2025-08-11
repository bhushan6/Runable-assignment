import * as recast from "recast";
import * as babelParser from "@babel/parser";

export type UID = string;

export function initializeAST(code: string) {
  const ast = babelParser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript", "classProperties", "objectRestSpread"],
    errorRecovery: true,
  });

  const b = recast.types.builders;
  const { visit } = recast.types;
  const uidMap = new Map<UID, any>();
  let counter = 0;

  visit(ast, {
    visitJSXOpeningElement(path: any) {
      const attrs = path.node.attributes || [];
      const hasUid = attrs.some(
        (a: any) => a && a.name && a.name.name === "data-uid"
      );

      if (!hasUid) {
        const uid = `el-${counter++}`;
        const uidAttr = b.jsxAttribute(
          b.jsxIdentifier("data-uid"),
          b.stringLiteral(uid)
        );
        attrs.push(uidAttr);
        path.node.attributes = attrs;
        const elementNode = path.parentPath.node;
        uidMap.set(uid, elementNode);
      } else {
        const attr = attrs.find(
          (a: any) => a && a.name && a.name.name === "data-uid"
        );
        const uid = attr.value.value;
        uidMap.set(uid, path.parentPath.node);
      }
      this.traverse(path);
    },
  });

  const codeOut = recast.print(ast).code;
  return { ast, code: codeOut, uidMap };
}

export function updateElement(
  state: any,
  uid: UID,
  updates: { text?: string; style?: Record<string, string> }
) {
  const b = recast.types.builders;
  const elementNode = state.uidMap.get(uid);
  if (!elementNode) return state;

  if (updates.text !== undefined) {
    elementNode.children = [b.jsxText(updates.text)];
  }

  if (updates.style && Object.keys(updates.style).length) {
    const opening = elementNode.openingElement;
    let styleAttr = (opening.attributes || []).find(
      (a: any) => a.type === "JSXAttribute" && a.name.name === "style"
    );

    if (!styleAttr) {
      styleAttr = b.jsxAttribute(
        b.jsxIdentifier("style"),
        b.jsxExpressionContainer(b.objectExpression([]))
      );
      opening.attributes = opening.attributes || [];
      opening.attributes.push(styleAttr);
    }

    const styleExpr = styleAttr.value.expression;
    const existing = new Map<string, any>();
    styleExpr.properties.forEach((p: any) => {
      if (p.key && p.key.name) existing.set(p.key.name, p);
    });

    Object.entries(updates.style).forEach(([k, v]) => {
      const keyName = k.replace(/-([a-z])/g, (_m, g) => g.toUpperCase());
      if (existing.has(keyName)) {
        existing.get(keyName).value = b.stringLiteral(v);
      } else {
        styleExpr.properties.push(
          b.objectProperty(b.identifier(keyName), b.stringLiteral(v))
        );
      }
    });
  }

  const codeOut = recast.print(state.ast).code;
  return { ...state, code: codeOut };
}
