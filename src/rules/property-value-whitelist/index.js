import { vendor } from "postcss"
import { isObject, isEmpty, find } from "lodash"
import {
  report,
  ruleMessages,
  validateOptions,
  matchesStringOrRegExp,
} from "../../utils"

export const ruleName = "property-value-whitelist"

export const messages = ruleMessages(ruleName, {
  rejected: (property, value) => `Unexpected value "${value}" for property "${property}"`,
})

export default function (whitelist) {
  return (root, result) => {

    result.warn((
      "'property-value-whitelist' has been deprecated, "
        + "and will be removed in '7.0'. Use 'declaration-property-value-whitelist' instead."
    ), {
      stylelintType: "deprecation",
      stylelintReference: "http://stylelint.io/user-guide/rules/declaration-property-value-whitelist/",
    })

    const validOptions = validateOptions(result, ruleName, {
      actual: whitelist,
      possible: [isObject],
    })
    if (!validOptions) { return }

    root.walkDecls(decl => {

      const { prop, value } = decl
      const unprefixedProp = vendor.unprefixed(prop)
      const propWhitelist = find(whitelist, (list, propIdentifier) => matchesStringOrRegExp(unprefixedProp, propIdentifier))

      if (isEmpty(propWhitelist)) { return }

      if (matchesStringOrRegExp(value, propWhitelist)) { return }

      report({
        message: messages.rejected(prop, value),
        node: decl,
        result,
        ruleName,
      })
    })
  }
}
