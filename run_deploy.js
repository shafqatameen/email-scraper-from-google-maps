const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function deploy() {
  console.log("Connecting to the server...");
  try {
    await ssh.connect({
      host: '194.233.90.130',
      username: 'shafqat',
      password: 'System@123',
      readyTimeout: 15000,
      tryKeyboard: true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish(['System@123']);
        }
      }
    });

    console.log("Successfully connected!");
    
    // Read the bash script and base64 encode it
    const scriptContent = fs.readFileSync('c:/xampp/htdocs/projects/email-scraper-from-google-maps/deploy_setup.sh', 'utf8');
    const b64Script = Buffer.from(scriptContent).toString('base64');

    console.log("Running deployment script (this will take several minutes)...");
    
    // Execute the base64 decoded script through sudo bash
    const cmd = `echo "System@123" | sudo -S bash -c "$(echo ${b64Script} | base64 --decode)"`;

    const result = await ssh.execCommand(cmd, {
      onStdout(chunk) {
        process.stdout.write(chunk.toString('utf8'));
      },
      onStderr(chunk) {
        process.stderr.write(chunk.toString('utf8'));
      }
    });

    console.log("\n--- Deployment finished ---");
    console.log("Exit code: ", result.code);
    
    ssh.dispose();
  } catch (err) {
    console.error("Deployment failed:", err);
    if(ssh) ssh.dispose();
  }
}

deploy();
