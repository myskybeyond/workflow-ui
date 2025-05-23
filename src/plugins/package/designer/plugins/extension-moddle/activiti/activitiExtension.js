'use strict';

import * as min_dash from 'min-dash';

var some = min_dash.some;

var ALLOWED_TYPES = {
  FailedJobRetryTimeCycle: ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:Activity'],
  Connector: ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent'],
  Field: ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent']
};

function is(element, type) {
  return element && typeof element.$instanceOf === 'function' && element.$instanceOf(type);
}

function exists(element) {
  return element && element.length;
}

function includesType(collection, type) {
  return (
    exists(collection) &&
    some(collection, function (element) {
      return is(element, type);
    })
  );
}

function anyType(element, types) {
  return some(types, function (type) {
    return is(element, type);
  });
}

function isAllowed(propName, propDescriptor, newElement) {
  var name = propDescriptor.name,
    types = ALLOWED_TYPES[name.replace(/activiti:/, '')];

  return name === propName && anyType(newElement, types);
}

function ActivitiModdleExtension(eventBus) {
  eventBus.on(
    'property.clone',
    function (context) {
      var newElement = context.newElement,
        propDescriptor = context.propertyDescriptor;

      this.canCloneProperty(newElement, propDescriptor);
    },
    this
  );
}

ActivitiModdleExtension.$inject = ['eventBus'];

ActivitiModdleExtension.prototype.canCloneProperty = function (newElement, propDescriptor) {
  if (isAllowed('activiti:FailedJobRetryTimeCycle', propDescriptor, newElement)) {
    return (
      includesType(newElement.eventDefinitions, 'bpmn:TimerEventDefinition') ||
      includesType(newElement.eventDefinitions, 'bpmn:SignalEventDefinition') ||
      is(newElement.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')
    );
  }

  if (isAllowed('activiti:Connector', propDescriptor, newElement)) {
    return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
  }

  if (isAllowed('activiti:Field', propDescriptor, newElement)) {
    return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
  }
};

export default ActivitiModdleExtension;
