const Octokit = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

async function main() {
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN
  });

  // Github actions
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const [, issue_number] = process.env.GITHUB_REF.match(/^refs\/pull\/(\d+)\/merge$/);

  // Circleci
  // const {
  //   CIRCLE_PR_NUMBER: issue_number,
  //   CIRCLE_PROJECT_USERNAME: owner,
  //   CIRCLE_PROJECT_REPONAME: repo
  // } = process.env;

  const reportFilenameList = (await fs.promises.readdir(path.resolve(__dirname, ".lighthouseci")))
    .filter(file => file.endsWith(".json"));

  const message = `## Lighthouse audit results\u202f:

  ${(await Promise.all(reportFilenameList.map(async reportFilename => {
    const report = JSON.parse(await fs.promises.readFile(path.resolve(__dirname, ".lighthouseci", reportFilename)));

    return `<details>
  <summary>for ${report.requestedUrl}</summary>

  <br>

  |Cat|Score|
  |---|---|
  |Performance|${(report.categories["performance"].score * 100).toFixed(0)}|
  |Accessibility|${(report.categories["accessibility"].score * 100).toFixed(0)}|
  |Best practices|${(report.categories["best-practices"].score * 100).toFixed(0)}|
  |SEO|${(report.categories["seo"].score * 100).toFixed(0)}|
  |PWA|${(report.categories["pwa"].score * 100).toFixed(0)}|
</details>`
  }))).join("\n\n")}`;

  await octokit.issues.createComment({
    owner,
    repo,
    body: message,
    issue_number
  });
}

main();
