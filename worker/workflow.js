const errors = require('restify-errors');
  usageManager = require('dbf-usagemanager'),
  objectStore = require('../lib/ObjectStore');

const save = (req, res, next) => {

  // workflow data object should contain in req.body
  if (!req.body) {
    return next(
      new errors.BadRequestError("Invalid post payload.")
    );
  }

  const tenant = req.params.tenant,
    criteria = req.params.criteria || "tenant",
    body = req.body,
    namespace = body.Class || "process_flows",
    keyProperty = body.KeyProperty || "ID";

  // declare usage rules
  // 'usageRules' array filled with promises
  const usageRules = [
    usageManager.validate(tenant, 'WorkFlows', '1', criteria),
    usageManager.validate(tenant, 'constainers', '1', criteria)
  ];

  // validate user's workflow storing quota before save new one
  // execute all usage rules parallelly.
  Promise.all(usageRules).then((rules) => {
    // all rules executed correctly
    if (rules && rules.length) {
      // get usege rules status
      let agreeWithUsageRules = rules.every((rule) => { return rule.IsSuccess; });
      // all usage rules passed
      if (agreeWithUsageRules) {
        // store workflow on object store
        objectStore.insertSingle(namespace, tenant, keyProperty, body.Data, (response) => {
          // handle objectstore response
          // update usage rules
          Promise.all([
            usageManager.Rate(tenant, 'WorkFlows', 1, criteria),
            usageManager.Rate(tenant, 'constainers', 1, criteria)
          ]).then((rules) => {
            if (rules && rules.length) { 
              let allRulesRateUpdated = rules.every((rule) => { return rule.IsSuccess; });
              if (allRulesRateUpdated) {
                res.send(201, {"success": true, "message": "Workflow successfully saved."});
                next();
              }else {
                res.send({"success": false, "message": "An error occurred while updating usage rules."});
                next();
              }
            }else {
              res.send({"success": false, "message": "An error occurred while updating usage rules."});
              next();
            }
          }, (err) => {
            return next(err);
          });
        });
      }else {
        return next(
          new errors.TooManyRequestsError(rules[0].message)
        );
      }
    }
  }, (err) => {
    return next(err);
  });
};

const remove = (req, res, next) => {

  if (!req.body) {
    return next(
      new errors.BadRequestError("Invalid delete payload.")
    );
  }

  const tenant = req.params.tenant,
    criteria = req.params.criteria || "tenant",
    body = req.body,
    namespace = body.Class || "process_flows",
    keyProperty = body.KeyProperty || "ID",
    deletedWFCount = 0;

  if (body.Data && body.Data.length) {
    body.Data.forEach(version => {
      objectStore.deleteSingle(namespace, tenant, keyProperty, body.Data, (response) => {
        if (response && response.IsSuccess) {
          deletedWFCount++;
        }
      });
    });

    Promise.all([
      usageManager.Rate(tenant, 'WorkFlows', (deletedWFCount * -1), criteria),
      usageManager.Rate(tenant, 'constainers', (deletedWFCount * -1), criteria)
    ]).then((rules) => {
      if (rules && rules.length) { 
        let allRulesRateUpdated = rules.every((rule) => { return rule.IsSuccess; });
        if (allRulesRateUpdated) {
          res.send({"success": true, "message": "Workflow successfully deleted."});
          next();
        }else {
          res.send({"success": false, "message": "An error occurred while updating usage rules."});
          next();
        }
      }else {
        res.send({"success": false, "message": "An error occurred while updating usage rules."});
        next();
      }
    }, (err) => {
      return next(err);
    });

  }else {
    return next(
      new errors.BadRequestError("Delete payload doesn't contain any workflows to delete")
    );
  }
};

module.exports = {
  save,
  remove
}

