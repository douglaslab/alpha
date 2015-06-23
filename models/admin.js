'use strict';

const ELEMENT = 'PERMISSION';
var debug = require('debug')('admin');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates
var helper = require('./modelHelper');

/**
 * @class AdminModel
 * @classdesc model for users management
 */
var AdminModel = function() {
  var AuditModel = require('./schemas/audit');
  var PermissionModel = require('./schemas/permission');

  /**
   * Get audits log
   * @memberof AdminModel
   * @param  {Object}   req  Request object - query contains search criteria
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.getAuditLog = function(req, res, next) {
    var criteria = req.query;
    var search = {};
    Object.keys(criteria).forEach((field) => {
      if(field === 'from') {
        if(!search.created) {
          search.created = {};
        }
        search.created.$gte = criteria.from ? new Date(parseInt(criteria.from, 10)) : new Date(0);
      }
      else if(field === 'to') {
        if(!search.created) {
          search.created = {};
        }
        search.created.$lt = criteria.to ? new Date(parseInt(criteria.to, 10)) : Date.now();
      }
      else {
        search[field] = criteria[field];
      }
    });
    debug(criteria, search);
    AuditModel.find(search).sort('-created').exec((err, result) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        res.json(200, {error: false, data: result.map(item => item.toObject())});
      }
      return next();
    });
  };

  this.getPermissions = function(req, res, next) {
    var search = {};
    Object.keys(req.query).forEach(param => search[param] = req.query[param]);
    debug(search);
    PermissionModel.find(search, (err, result) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        if(result) {
          res.json(200, {error: false, data: result.map(item => item.toObject())});
          helper.log(req.user.email, ELEMENT, 'get', util.format('%s', req.params));
        }
      }
      return next();
    });
  };

  this.createPermission = function(req, res, next) {
    var search = {
      element: req.body.element,
      action: req.body.action
    };
    var update = {
      element: req.body.element,
      action: req.body.action,
      permissionRequired: req.body.permissionRequired
    };
    PermissionModel.findOne(search, (err, result) => {
      if(err) {
        helper.handleError(500, err, res);
        return next();
      }
      else if(result) {
        result.permissionRequired = update.permissionRequired;
      }
      else {
        result = new PermissionModel(update);
      }
      result.save((err2, result2) => {
        if(err2) {
          helper.handleError(401, err2, res);
        }
        else {
          debug(result2);
          if(result2) {
            res.json(201, {error: false, data: result2.toObject()});
            helper.log(req.user.email, ELEMENT, 'add', util.format('%s %s %s', result2.element, result2.action, result2.permissionRequired));
          }
        }
        return next();
      });
    });
  };
};

module.exports = new AdminModel();
