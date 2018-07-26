/**
 * Created by Kalana on 3/1/2016.
 */



//var https = require('https');
var http = require('http');
var configuration = require ('config');

//var express = require('express');
//var logger = require('morgan');


//Always the same, should be changed according to hosting
var url=configuration.ObjectSore.ip;
var port=configuration.ObjectSore.port;



//Get All elements in class
function getAll(Table, Skip, Take,Namespace,response){

    var namespace=Namespace;            //Namespace of the user
    var table =Table;                   //Class Name
    var securityToken='123';    //Token Issued
    //var skip=Skip;                      //Start point to take values
    //var take=Take;                      //End Point to take values

    //console.log(Skip," ",Take)
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        //Sample Foramat
        //path: '/duoworld.duoweb.info/customer?Skip=0&take=100',
        path: '/'+namespace+'/'+table+'?skip='+Skip+'&take='+Take,
        method: 'GET'
    };

    //console.log(options.path)

    //Calling Common GET located below
    GETzilla(options,function (found){

        var result=JSON.parse(found);
        var key = "__osHeaders";            //Response Stream Header

        var stringA=('{"'+table+'":[');
        var stringB='';
        //res.write('[{'+table+': \n');
        for(var i = 0; i < result.length; i++) {
            var obj = result[i];
            delete obj[key];
            if(i==result.length-1){
                stringB= stringB+(JSON.stringify(obj));
            }
            else{
                stringB= stringB+(JSON.stringify(obj)+',');
            }

            //console.log(obj);
            //console.log(i);
        }

        //Reformatted output String
        var final=stringA+stringB+']}';

        //console.log(final);
        response(final);


    });
}

function getAllbyID(Table, Id, NameSpace, response){

    var table=Table;
    var id=Id;
    var securityToken='123';
    //var namespace=NameSpace;

    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        //path: '/duoworld.duoweb.info/customer?id=1000',
        path: '/'+NameSpace+'/'+table+'/'+id,
        method: 'GET'
    };

    GETzilla(options,function (found){
        //console.log(found);
        //var result=JSON.stringify(found);
        response(found);
        //res.end("");

    });

}




function insertSingle(Table, NameSpace, KeyProperty, Object, response) {

    var table=Table;
    var securityToken="123";
    var namespace=NameSpace;
    var keyProp = KeyProperty;          //Primary Key Property
    var obj = Object;                   //JSON Object to be inserted


    var post_data = JSON.stringify({"Object": obj, "Parameters": {"KeyProperty": keyProp}});

    //console.log(post_data);
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        path: '/'+namespace+'/' + table,
        method: 'POST'
    };


    POSTmaster(post_data, options, function (found) {
        //console.log(found);
        //var result=JSON.stringify(found);
        response(found);
        //res.end("");

    });


}

function deleteSingle(Table, NameSpace, KeyProperty, Object, response) {

    var table=Table;
    var securityToken="123";
    var namespace=NameSpace;
    var keyProp = KeyProperty;          //Primary Key Property
    var obj = Object;                   //JSON Object to be inserted


    var post_data = JSON.stringify({"Object": obj, "Parameters": {"KeyProperty": keyProp}});

    //console.log(post_data);
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        path: '/'+namespace+'/' + table,
        method: 'DELETE'
    };


    POSTmaster(post_data, options, function (found) {
        //console.log(found);
        //var result=JSON.stringify(found);
        response(found);
        //res.end("");

    });


}

function insertMultiple(Table, NameSpace, KeyProperty, Object, response) {

    var table=Table;
    var securityToken='123';
    var namespace=NameSpace;
    //var keyProp = KeyProperty;          //Primary Key Property
    //var obj = Object;                   //JSON Object to be inserted


    //Only change with single insert is "Object"->"Objects"
    //Obj format [{},{},{}]
    var post_data = JSON.stringify({"Objects": Object, "Parameters": {"KeyProperty": KeyProperty}});

    //console.log(post_data);
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        path: '/'+namespace+'/' + table,
        method: 'POST'
    };


    POSTmaster(post_data, options, function (found) {
        //console.log(found);
        //var result=JSON.stringify(found);
        response(found);
        //res.end("");

    });


}

function sqlQuery(Table, NameSpace, Query, response) {

    var table=Table;
    var securityToken='123';
    //var namespace=NameSpace;
    //var Query = Query;          //Should be case sensitive for field names atm.

    //console.log(Query);
    //{"Query":{"Type":"Query", "Parameters":"select * from customer where Id=5003"}}
    var post_data = JSON.stringify({"Query":{"Type":"Query", "Parameters":Query}});

    //console.log(post_data);
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        path: '/'+NameSpace+'/' + table,
        method: 'POST'
    };


    POSTmaster(post_data, options, function (found) {
        //console.log(found);
        response(found);


    });


}


function special(Table, NameSpace, Type, response) {

    var table=Table;
    var securityToken="123";
    var namespace=NameSpace;


    var post_data = JSON.stringify({"Special":{"Type":Type, "Parameters":""}});

    //console.log(post_data);
    var options = {
        headers: {
            'securityToken': securityToken,
            'log': 'log'
        },
        host: url,
        port: port,
        path: '/'+namespace+'/' + table,
        method: 'POST'
    };


    POSTmaster(post_data, options, function (found) {
        //console.log(found);
        //var result=JSON.stringify(found);
        response(found);
        //res.end("");

    });


}



//TO GET everything
function GETzilla(options, onres) {

    var result;
    http.request(options, function(response) {
        //console.log('STATUS: ' + response.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            result += chunk.toString();
            result = result.replace('undefined','');
            //result = result.replace(/\\/g,'');
            //result=JSON.stringify(chunk);

            //console.log(result);
            //console.log(str);


        });

        response.on('end', function () {
            //console.log(result);
            //var obj=result;
            //console.log(obj);
            onres(result);
        });
        response.on('error', function (error) {
            console.log('Error Occured error code: ' + error);
        });



    }).end();
    //console.log(data);

}

//TO POST everything
function POSTmaster(post_data, options, onres) {


    var result;
    // Set up the request
    var post_req=http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            result += chunk.toString();
            result = result.replace('undefined','');
            //console.log('Response: ' + chunk);
        });
        res.on('end', function () {
            //console.log(result);
            //var obj=result;
            //console.log(obj);
            onres(result);

        });
        res.on('error', function (error) {
            console.log('Error Occured error code: ' + error);
        });


    });

    post_req.write(post_data);
    post_req.end();

    // post the data


}

exports.special=special;
exports.getall=getAll;
exports.getallbyid=getAllbyID;
exports.insertSingle=insertSingle;
exports.insertMultiple=insertMultiple;
exports.deleteSingle=deleteSingle;
exports.sqlQuery=sqlQuery;
