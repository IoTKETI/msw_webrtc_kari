/**
 * Created by Wonseok Jung in KETI on 2021-06-28.
 */

// for TAS of mission
var fs = require('fs');
var spawn = require('child_process').spawn;

var my_msw_name = 'msw_webrtc';

var fc = {};
var config = {};

config.name = my_msw_name;
config.lib = [];

// library 추가
var add_lib = {};
try {
    add_lib = JSON.parse(fs.readFileSync('../' + 'webrtc_conf.json', 'utf8'), {cwd});
    config.lib.push(add_lib);
}
catch (e) {
    add_lib = {
        directory_name: config.name + '_' + config.name,
        host: '203.253.128.177',
        display_name: 'KETI_demo',
        thismav_sysid: 1234
    };
    config.lib.push(add_lib);
}

function runLib(obj_lib) {
    console.log(obj_lib);
    console.log(obj_lib.directory_name);
    try {
        console.log('python3', ' ', './' + obj_lib.directory_name + '/lib_webrtc.py', obj_lib.host, obj_lib.display_name, obj_lib.thismav_sysid);
        var run_lib = spawn('python3', ['./' + obj_lib.directory_name + '/lib_webrtc.py', obj_lib.host, obj_lib.display_name, obj_lib.thismav_sysid]);

        run_lib.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        run_lib.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        run_lib.on('exit', function(code) {
            console.log('exit: ' + code);

            setTimeout(runLib, 3000, obj_lib);
        });

        run_lib.on('error', function(code) {
            console.log('error: ' + code);
        });
    }
    catch (e) {
        console.log(e.message);
    }
}

setTimeout(runLib, 1000, config.lib);
