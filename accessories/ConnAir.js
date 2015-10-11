var types = require("HAP-NodeJS/accessories/types.js");
var dgram = require("dgram");

function ConnAirAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.master = config["master"];
    this.slave = config["slave"];
    this.ip = config["ip"];
}

ConnAirAccessory.prototype = {
    setPowerState: function (power) {
        var sA = '0';
        var sG = '0';
        var repeat = '10';
        var pause = '5600';
        var tune = '350';
        var baud = '25';
        var speed = '16';
        var txVersion = '1';

        var head = "TXP:{0},{1},{2},{3},{4},{5},".format(sA, sG, repeat, pause, tune, baud);
        var tail = ",{0},1,{1},;".format(txVersion, speed);

        var on = '1,3,1,3,3';
        var off = '3,1,1,3,1';

        var bitLow = '1';
        var bitHigh = '3';

        var seqLow = '{0},{1},{2},{3},'.format(bitHigh, bitHigh, bitLow, bitLow);
        var seqHigh = '{0},{1},{2},{3},'.format(bitHigh, bitLow, bitHigh, bitLow);

        var bits = this.master;
        var msgM = '';

        for(var i = 0; i < this.master.length; i++)
        {
            var bit = this.master.charAt(i);
            if(bit == '0')
              msgM = '{0}{1}'.format(msgM, seqLow);
            else
              msgM = '{0}{1}'.format(msgM, seqHigh);
        }
        bits = this.slave;
        var msgS = '';
        for(var i = 0; i < this.slave.length; i++)
        {
            var bit = this.slave.charAt(i);
            if(bit == '0')
              msgS = '{0}{1}'.format(msgS, seqLow);
            else
              msgS = '{0}{1}'.format(msgS, seqHigh);
        }

        var message = '';
        if(power)
           message = '{0}{1},{2}{3}{4},{5}{6}'.format(head, bitLow, msgM, msgS, bitHigh,
            on, tail);
        else
          message = '{0}{1},{2}{3}{4},{5}{6}'.format(head, bitLow, msgM, msgS, bitHigh,
            off, tail);

        console.log(message);

        var udpMessage = new Buffer(message);
        var client = dgram.createSocket("udp4");
        client.send(udpMessage, 0, udpMessage.length, 49880, this.ip,
          function(err) {
          client.close();
        });
      },
    getServices: function() {
        var that = this;
        return [{
            sType: types.ACCESSORY_INFORMATION_STYPE,
            characteristics: [{
                cType: types.NAME_CTYPE,
                onUpdate: null,
                perms: ["pr"],
                format: "string",
                initialValue: this.name,
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Name of the accessory",
                designedMaxLength: 255
            },{
                cType: types.MANUFACTURER_CTYPE,
                onUpdate: null,
                perms: ["pr"],
                format: "string",
                initialValue: "ConnAir",
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Manufacturer",
                designedMaxLength: 255
            },{
                cType: types.MODEL_CTYPE,
                onUpdate: null,
                perms: ["pr"],
                format: "string",
                initialValue: "Rev-1",
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Model",
                designedMaxLength: 255
            },{
                cType: types.SERIAL_NUMBER_CTYPE,
                onUpdate: null,
                perms: ["pr"],
                format: "string",
                initialValue: "08/15",
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "SN",
                designedMaxLength: 255
            },{
                cType: types.IDENTIFY_CTYPE,
                onUpdate: null,
                perms: ["pw"],
                format: "bool",
                initialValue: false,
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Identify Accessory",
                designedMaxLength: 1
            }]
        },{
            sType: types.SWITCH_STYPE,
            characteristics: [{
                cType: types.NAME_CTYPE,
                onUpdate: null,
                perms: ["pr"],
                format: "string",
                initialValue: this.name,
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Name of service",
                designedMaxLength: 255
            },{
                cType: types.POWER_STATE_CTYPE,
                onUpdate: function(value) { that.setPowerState(value); },
                perms: ["pw","pr","ev"],
                format: "bool",
                initialValue: false,
                supportEvents: false,
                supportBonjour: false,
                manfDescription: "Change the power state of the car",
                designedMaxLength: 1
            }]
        }];
    }
};

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}


module.exports.accessory = ConnAirAccessory;
