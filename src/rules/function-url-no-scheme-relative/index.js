import valueParser from "postcss-value-parser"
import {
  declarationValueIndex,
  isStandardSyntaxValue,
  isVariable,
  report,
  ruleMessages,
  validateOptions,
} from "../../utils"

export const ruleName = "function-url-no-scheme-relative"

export const messages = ruleMessages(ruleName, {
  rejected: "Unexpected scheme-relative url",
})

export default function (actual) {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, { actual })
    if (!validOptions) { return }

    root.walkDecls(function (decl) {
      valueParser(decl.value).walk(valueNode => {
        if (valueNode.type !== "function"
          || valueNode.value.toLowerCase() !== "url"
          || valueNode.nodes.length === 0
        ) { return }

        const urlValueNode = valueNode.nodes[0]

        if (!urlValueNode.value
          || !isStandardSyntaxValue(urlValueNode.value)
          || isVariable(urlValueNode.value)
        ) { return }

        const urlValue = urlValueNode.value

        if (urlValue.indexOf("//")) { return }

        report({
          message: messages.rejected,
          node: decl,
          // declaration value index + `url` + `(` + whitespace before + source index of value
          index: declarationValueIndex(decl)
            + valueNode.value.length
            + 1
            + valueNode.before.length
            + valueNode.sourceIndex,
          result,
          ruleName,
        })
      })
    })
  }
}
