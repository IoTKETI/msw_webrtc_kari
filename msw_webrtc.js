/**
 * Created by Wonseok Jung in KETI on 2021-06-28.
 */

// for TAS of mission
let mqtt = require('mqtt');
let fs = require('fs');
let spawn = require('child_process').spawn;

let my_msw_name = 'msw_webrtc';

let config = {};

config.name = my_msw_name;
config.lib = [];

// library 추가
let add_lib = {};
try {
    add_lib = JSON.parse(fs.readFileSync('./webrtc_conf.json', 'utf8'));
    config.lib.push(add_lib);
} catch (e) {
    add_lib = {
        gcs: 'KETI_MUV',
        drone: 'KETI_Demo',
        directory_name: config.name + '_' + config.name,
        host: '203.253.128.177',
        display_name: 'KETIDemo',
        thismav_sysid: 1234
    };
    config.lib.push(add_lib);
}

let run_lib;

function runLib(obj_lib) {
    try {
        run_lib = spawn('./lib_webrtc.py', [obj_lib.host, obj_lib.display_name, obj_lib.thismav_sysid]);
        run_lib.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        run_lib.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        run_lib.on('exit', function (code) {
            console.log('exit: ' + code);
            if (code === null) {
                console.log('code is null');
                run_lib.kill();
            } else {
                // setTimeout(runLib, 3000, obj_lib);
            }
        });

        run_lib.on('error', function (code) {
            console.log('error: ' + code);
        });
    } catch (e) {
        console.log(e.message);
    }
}

let msw_mqtt_client = null;

msw_mqtt_connect(config.lib[0].host, 1883);

let webrtc_status_topic = '/Mobius/' + config.lib[0].gcs + '/Mission_Data/' + config.lib[0].drone + '/' + config.name + '/STATUS'

console.log(webrtc_status_topic);

function msw_mqtt_connect(broker_ip, port) {
    if (msw_mqtt_client === null) {
        let connectOptions = {
            host: broker_ip,
            port: port,
            protocol: "mqtt",
            keepalive: 10,
            protocolId: "MQTT",
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 2000,
            connectTimeout: 2000,
            rejectUnauthorized: false
        };

        msw_mqtt_client = mqtt.connect(connectOptions);
    }

    msw_mqtt_client.on('connect', function () {
        console.log('[msw_mqtt_connect] connected to ' + broker_ip);
        if (webrtc_status_topic !== '') {
            msw_mqtt_client.subscribe(webrtc_status_topic, function () {
                console.log('[webrtc_mqtt_connect] webrtc_status_topic is subscribed: ' + webrtc_status_topic);
            });
        }
    });

    msw_mqtt_client.on('message', function (topic, message) {
        if (topic === webrtc_status_topic) {
            if (message.toString() === 'ON') {
                setTimeout(runLib, 1000, config.lib[0]);
            } else if (message.toString() === 'OFF') {
                run_lib.kill('SIGKILL');
            } else {
            }
        }
    });

    msw_mqtt_client.on('error', function (err) {
        console.log(err.message);
    });
    msw_mqtt_client.on('end', function () {
        console.log('msw_mqtt_connect CLOSE..');
    });
}
