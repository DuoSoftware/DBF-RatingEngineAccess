module.exports = {
    "Redis": {
        "mode": "instance", //instance, cluster, sentinel
        "ip": "",
        "port": 0,
        "user": "",
        "password": "",
        "sentinels": {
            "hosts": "",
            "port": 0,
            "name": "redis-cluster"
        }
    },
    "RabbitMQ": {
        "ip": "",
        "port": 0,
        "user": "",
        "password": "",
        "vhost": ""
    },
    "ObjectSore": {
        "ip": "",
        "port": 0,
        "protocol": ""
    },
    "Host": {
        "resource": "cluster",
        "port": 0
    },
    "Security": {
        "ip": "",
        "port": 0,
        "user": "",
        "password": "",
        "mode": "sentinel", // instance, cluster, sentinel
        "sentinels": {
          "hosts": "",
          "port": 0,
          "name": "redis-cluster"
        }
      },
};