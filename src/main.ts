import * as core from '@actions/core'
import * as github from '@actions/github'

function escapeMarkdown(text: string) {
  // Escape markdown characters https://core.telegram.org/bots/api#markdownv2-style
  // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  let escaped = '';
  escaped = text.replace('_', '\\\\\\_')
  escaped = escaped.replace('*', '\\\\\\*')
  escaped = escaped.replace('[', '\\\\\\[')
  escaped = escaped.replace(']', '\\\\\\]')
  escaped = escaped.replace('(', '\\\\\\(')
  escaped = escaped.replace(')', '\\\\\\)')
  escaped = escaped.replace('~', '\\\\\\~')
  escaped = escaped.replace('`', '\\\\\\`')
  escaped = escaped.replace('>', '\\\\\\>')
  escaped = escaped.replace('#', '\\\\\\#')
  escaped = escaped.replace('+', '\\\\\\+')
  escaped = escaped.replace('-', '\\\\\\-')
  escaped = escaped.replace('=', '\\\\\\=')
  escaped = escaped.replace('|', '\\\\\\|')
  escaped = escaped.replace('{', '\\\\\\{')
  escaped = escaped.replace('}', '\\\\\\}')
  escaped = escaped.replace('.', '\\\\\\.')
  escaped = escaped.replace('!', '\\\\\\!')

  return escaped;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const botToken = core.getInput('bot-token');
    const chatID = core.getInput('chat-id');

    switch (github.context.eventName) {
      case 'issues':
        const issueNumber = escapeMarkdown(github.context.payload.issue?.number!.toString() as string);
        const issueLink = escapeMarkdown(github.context.payload.issue?.html_url!);
        const repoLink = escapeMarkdown(github.context.payload.repository?.html_url!);
        const repoName = escapeMarkdown(github.context.payload.repository?.name!);
        const action = escapeMarkdown(github.context.payload.action!);
        const issueTitle = github.context.payload.issue?.title!;
        const issueBody = github.context.payload.issue?.body!;
        const issueUser = escapeMarkdown(github.context.payload.issue?.user?.login! as string);
        const issueUserLink = escapeMarkdown(github.context.payload.issue?.user?.html_url! as string);

        let issueMarkdown = `[\\\\\\#${issueNumber}](${issueLink}) by [${issueUser}](${issueUserLink}) in [${repoName}](${repoLink}) ${action}\n\n`;
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

        console.log(JSON.stringify(issuePayload))

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, issueOptions).then((response: Response) => {
          if (!response.ok) {
            core.setFailed(`HTTP error ${response.status}`);
          }
        }).catch((e: any) => {
          console.error(e);
          core.setFailed(e);
        });

        break;
      case 'discussion':
        break;
      default:
        core.setFailed('Event not supported');
    }
  } catch (e: any) {
    console.error(e);
    core.setFailed(e);
  }
}
