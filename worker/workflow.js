const errors = require('restify-errors');
  usageManager = require('dbf-usagemanager'),
  logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
  objectStore = require('../lib/ObjectStore');

const save = (req, res, next) => {

  logger.debug("DBF-RatingEngineAccess.WorkflowSave Internal method");

  // workflow data object should contain in req.body
  if (!req.body) {
    logger.debug("WorkflowSave: Invalid post payload.", req.body);
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
        logger.debug("WorkflowSave: All usage rules executed and accepted.");
        // store workflow on object store
        objectStore.insertSingle(namespace, tenant, keyProperty, body.Data, (response) => {
<<<<<<< Updated upstream
          // handle objectstore response
          // update usage rules
          Promise.all([
            usageManager.Rate(tenant, 'WorkFlows', 1, criteria),
            usageManager.Rate(tenant, 'constainers', 1, criteria)
          ]).then((rules) => {
            if (rules && rules.length) { 
              console.log(rules);
              let allRulesRateUpdated = rules.every((rule) => { return rule.IsSuccess; });
              if (allRulesRateUpdated) {
                res.send(201, {"success": true, "message": "Workflow successfully saved."});
                next();
              }else {
=======
        // workflow saved successfully
          if (response && response.IsSuccess) {
            logger.debug("WorkflowSave: Workflow (%s) stored successfully.", body.Data.ID);
            // update usage rules
            Promise.all([
              usageManager.Rate(tenant, 'WorkFlows', 1, criteria),
              usageManager.Rate(tenant, 'constainers', 1, criteria)
            ]).then((rules) => {
              if (rules && rules.length) { 
                let allRulesRateUpdated = rules.every((rule) => { return rule.IsSuccess; });
                if (allRulesRateUpdated) {
                  // all usage rules updated
                  logger.debug("WorkflowSave: All usage rules updated.");
                  res.send(201, {"success": true, "message": "Workflow successfully saved."});
                  next();
                } else {
                  logger.debug("WorkflowSave: Error occurred while updating usage rules.");
                  res.send({"success": false, "message": "An error occurred while updating usage rules."});
                  next();
                }
              } else {
                logger.debug("WorkflowSave: Error occurred while updating usage rules.");
>>>>>>> Stashed changes
                res.send({"success": false, "message": "An error occurred while updating usage rules."});
                next();
              }
            }, (err) => {
              logger.debug("WorkflowSave: Error occurred while updating usage rules.");
              return next(err);
            });
          } else {
            logger.debug("WorkflowSave: Failed to save workflow.");
            res.send({"success": false, "message": "An error occurred while storing workflow."});
            next();
          }
        });
      } else {
        logger.debug("WorkflowSave: Usage rules are disobeyed.");
        return next(
          new errors.TooManyRequestsError(rules[0].message)
        );
      }
    } else {
      logger.debug("WorkflowSave: Failed to validate usage rules.");
      res.send({"success": false, "message": "An error occurred while validating usage rules."});
      next();
    }
  }, (err) => {
    logger.debug("WorkflowSave: Error occurred while validating usage rules.");
    return next(err);
  });
};

const remove = (req, res, next) => {

  logger.debug("DBF-RatingEngineAccess.WorkflowRemove Internal method");

  // workflow data object should contain in req.body
  if (!req.body) {
    logger.debug("WorkflowRemove: Invalid post payload.", req.body);
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

  // payload contains one or more workflows to delete
  if (body.Data && body.Data.length) {
    body.Data.forEach(version => {
      // delete each workflow from object store
      objectStore.deleteSingle(namespace, tenant, keyProperty, body.Data, (response) => {
        if (response && response.IsSuccess) {
          // keep count of no of deleted workflows
          deletedWFCount++;
        }
      });
    });

    // update usage rules
    Promise.all([
      usageManager.Rate(tenant, 'WorkFlows', (deletedWFCount * -1), criteria),
      usageManager.Rate(tenant, 'constainers', (deletedWFCount * -1), criteria)
    ]).then((rules) => {
      if (rules && rules.length) { 
        let allRulesRateUpdated = rules.every((rule) => { return rule.IsSuccess; });
        if (allRulesRateUpdated) {
          // all usage rules updated
          logger.debug("WorkflowRemove: Workflows successfully deleted.");
          res.send({"success": true, "message": "Workflows successfully deleted."});
          next();
        }else {
          logger.debug("WorkflowRemove: Error occurred while updating usage rules.");
          res.send({"success": false, "message": "An error occurred while updating usage rules."});
          next();
        }
      }else {
        logger.debug("WorkflowRemove: Error occurred while updating usage rules.");
        res.send({"success": false, "message": "An error occurred while updating usage rules."});
        next();
      }
    }, (err) => {
      logger.debug("WorkflowRemove: Error occurred while updating usage rules.");
      return next(err);
    });

  }else {
    logger.debug("WorkflowRemove: Delete payload doesn't contain any workflows to delete.");
    return next(
      new errors.BadRequestError("Delete payload doesn't contain any workflows to delete")
    );
  }
};

module.exports = {
  save,
  remove
}

