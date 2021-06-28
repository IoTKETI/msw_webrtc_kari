var spawn = require('child_process').spawn;

fork_msw();
function fork_msw(mission_name, directory_name) {
    // var executable_name = directory_name.replace(mission_name + '_', '');

    var nodeMsw = spawn('python3', ['lib_webrtc.py', '203.253.128.177', 'KETI_Apr', 253], {cwd: process.cwd() + '/msw_webrtc'});

    nodeMsw.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    nodeMsw.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });

    nodeMsw.on('exit', function(code) {
        console.log('exit: ' + code);
    });

    nodeMsw.on('error', function(code) {
        console.log('error: ' + code);

        setTimeout(fork_msw, 10, mission_name, directory_name);
    });
}


