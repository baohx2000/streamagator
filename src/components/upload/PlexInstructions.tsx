export function PlexInstructions() {
  return (
    <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-decimal list-inside">
      <li>
        <a
          href="./export-plex-history.txt"
          download="export-plex-history.py"
          className="text-indigo-500 hover:underline"
        >
          Download the export script
        </a>
      </li>
      <li>
        Install the requests library:
        <br />Ubuntu: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">sudo apt install python3-requests</code>
        <br />Other: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">pip install requests</code>
      </li>
      <li>Find your server URL and token: open Plex Web, press <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">F12</code> → Network tab → click anything in Plex → find any request to your Plex server and copy the base URL (e.g. <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">https://…plex.direct:32400</code>) and <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">X-Plex-Token</code> from that request</li>
      <li>
        Run the export script:
        <br />Ubuntu: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python3 export-plex-history.py --url YOUR_SERVER_URL --token YOUR_TOKEN</code>
        <br />Other: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python export-plex-history.py --url YOUR_SERVER_URL --token YOUR_TOKEN</code>
      </li>
      <li>Upload the generated <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">plex-history.csv</code> here</li>
    </ol>
  );
}
