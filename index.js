const core = require('@actions/core');
const github = require('@actions/github');

function escapeMarkdown(text) {
  // Escape markdown characters https://core.telegram.org/bots/api#markdownv2-style
  // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  let escaped = '';
  escaped = text.replace('_', '\\_')
  escaped = escaped.replace('*', '\\*')
  escaped = escaped.replace('[', '\\[')
  escaped = escaped.replace(']', '\\]')
  escaped = escaped.replace('(', '\\(')
  escaped = escaped.replace(')', '\\)')
  escaped = escaped.replace('~', '\\~')
  escaped = escaped.replace('`', '\\`')
  escaped = escaped.replace('>', '\\>')
  escaped = escaped.replace('#', '\\#')
  escaped = escaped.replace('+', '\\+')
  escaped = escaped.replace('-', '\\-')
  escaped = escaped.replace('=', '\\=')
  escaped = escaped.replace('|', '\\|')
  escaped = escaped.replace('{', '\\{')
  escaped = escaped.replace('}', '\\}')
  escaped = escaped.replace('.', '\\.')
  escaped = escaped.replace('!', '\\!')

  return escaped;
}

try {
  const botToken = core.getInput('bot-token');
  const chatID = core.getInput('chat-id');

  switch (github.context.eventName) {
    case 'issues':
      const issueNumber = escapeMarkdown(github.context.payload.issue?.number);
      const issueLink = escapeMarkdown(github.context.payload.issue?.html_url);
      const repoLink = escapeMarkdown(github.context.payload.repository?.html_url);
      const repoName = escapeMarkdown(github.context.payload.repository?.name);
      const action = escapeMarkdown(github.context.payload.action);
      const issueTitle = github.context.payload.issue?.title;
      const issueBody = github.context.payload.issue?.body;
      const issueUser = escapeMarkdown(github.context.payload.issue?.user?.login);
      const issueUserLink = escapeMarkdown(github.context.payload.issue?.user?.html_url);

      const issueMarkdown = `[#${issueNumber}](${issueLink}) by [${issueUser}](${issueUserLink}) in [${repoName}](${repoLink}) ${action}\n\n`;
      issueMarkdown += `Title: **${issueTitle}**\n\n`;
      // For each line in the body, add a > to make it a quote
      issueMarkdown += issueBody.split('\n').map((line) => `> ${line}`).join('\n');

      const issuePayload = {
        chat_id: chatID,
        text: issueMarkdown,
        parse_mode: 'MarkdownV2',
      };

      const issueOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issuePayload),
      };

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, issueOptions).then((response) => {
        if (!response.ok) {
          core.setFailed(`HTTP error ${response.status}`);
        }
      }).catch((e) => {
        console.log(e);
        core.setFailed(e.message);
      });

      break;
    case 'discussion':
      break;
    default:
      core.setFailed('Event not supported');
  }
} catch (e) {
  console.log(e);
  core.setFailed(e.message);
}
