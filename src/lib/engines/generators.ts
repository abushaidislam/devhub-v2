import * as Utils from './utils';
// Destructure what we need (or just use Utils.)
// Actually, since the lines might use the util functions directly, we should just import them all:
import { EngineResult, escapeHtml, textEncoder, fatalTextDecoder, bytesToBase64, decodeBase64Bytes, decodeUtf8, decodeJwtPart, MAX_REGEX_PATTERN_LENGTH, MAX_REGEX_TEXT_LENGTH, MAX_REGEX_MATCHES, nestedQuantifier, MAX_MARKDOWN_LENGTH, safeMarkdownHref, formatInlineMarkdown, splitMarkdownTableRow, isMarkdownTableSeparator, renderMarkdownTable, parseCsvRows, htmlEntityMap, MAX_BATCH_TOOL_LENGTH, ensureBatchInput, gitignoreTemplates, typeScriptIdentifier, generateGitignore } from './utils';
export { generateGitignore };

