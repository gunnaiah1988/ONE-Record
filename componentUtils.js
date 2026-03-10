// ===============================
// Atlas Global Flags & Logging Utility
// ===============================

// Enable Atlas debug logs by setting this flag to true in the browser console
window.AtlasDebug = window.AtlasDebug ?? false;

// Prevent multiple executions of componentUtils.js
if (window.AtlasUtilsLoaded) {
  window.AtlasLogger && window.AtlasLogger.log && window.AtlasLogger.log('componentUtils.js already loaded, skipping...');
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
  }
} else {
  window.AtlasUtilsLoaded = true;
}

// ===============================
// AtlasLogger: Bundle & Component Mounting Logger
// ===============================

window.AtlasLogger = {
  startTime: Date.now(),
  mountedComponents: new Set(),
  bundleLoaded: false,

  // Main log method (respects debug flag)
  log: function(message, data = null) {
    if (!window.AtlasDebug) return;
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const logMessage = `[Atlas] [${timestamp}] [+${elapsed}ms] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  },

  logBundleLoaded: function() {
    this.bundleLoaded = true;
    this.log('🚀 Atlas React Bundle loaded successfully!');
    this.log(`📦 Available components: ${Object.keys(window.Atlas || {}).filter(key => key.startsWith('mountAtlas')).join(', ')}`);
  },

  logComponentMount: function(type, id, config = {}) {
    this.mountedComponents.add(id);
    this.log(`✅ Mounted ${type} component: ${id}`, {
      type,
      id,
      config: Object.keys(config),
      totalMounted: this.mountedComponents.size
    });
  },

  logComponentError: function(type, id, error) {
    this.log(`❌ Failed to mount ${type} component: ${id}`, error);
  },

  logComponentNotFound: function(id) {
    this.log(`⚠️ Element not found: ${id}`);
  },

  logAtlasNotLoaded: function() {
    this.log(`⚠️ Atlas library not loaded yet`);
  },

  getStats: function() {
    return {
      bundleLoaded: this.bundleLoaded,
      totalMounted: this.mountedComponents.size,
      mountedComponents: Array.from(this.mountedComponents),
      elapsed: Date.now() - this.startTime
    };
  },

  printStats: function() {
    const stats = this.getStats();
    this.log('📊 Atlas Mounting Statistics:', stats);
  }
};

// Log initialization
window.AtlasLogger.log('🔧 Atlas Logger initialized');

// ===============================
// Atlas Mount Utilities
// ===============================

// Mount a single React component if it exists
window.mountReactComponentIfExists = function(type, id, config = {}, options = {}) {
  if (window.AtlasLogger) {
    window.AtlasLogger.log('mountReactComponentIfExists called with:', { type, id, config, options });
  }
  if (!window.Atlas) {
    window.AtlasLogger.logAtlasNotLoaded();
    return false;
  }
  const element = document.getElementById(id);
  if (!element) {
    window.AtlasLogger.logComponentNotFound(id);
    return false;
  }
  // --- Enhancement: auto-create children containers if specified as IDs or objects ---
  if (Array.isArray(config.children)) {
    config.children = config.children.map((child, idx) => {
      let childId = null;
      let style = undefined;
      if (typeof child === 'string') {
        childId = child;
      } else if (child && typeof child === 'object' && child.id) {
        childId = child.id;
        style = child.style;
      }
      if (childId) {
        // Create the div if it doesn't exist
        let childDiv = document.getElementById(childId);
        if (!childDiv) {
          childDiv = document.createElement('div');
          childDiv.id = childId;
          if (style && typeof style === 'object') {
            Object.assign(childDiv.style, style);
          }
          element.appendChild(childDiv);
        }
        // If React is available, return a React element, else null (the div is in DOM)
        if (window.React && window.React.createElement) {
          return window.React.createElement('div', { id: childId, key: childId, style });
        } else {
          return null;
        }
      }
      // If not a string or object with id, just return as is
      return child;
    });
  }
  // --- End enhancement ---
  const mountFunctionMap = {
    'button': 'mountAtlasButton',
    'input': 'mountAtlasInput',
    'dropdown': 'mountAtlasDropdown',
    'select': 'mountAtlasSelect',
    'checkbox': 'mountAtlasCheckbox',
    'radioGroup': 'mountAtlasRadioGroup',
    'fileUpload': 'mountAtlasFileUpload',
    'alert': 'mountAtlasAlert',
    'accordion': 'mountAtlasAccordion',
    'validationResults': 'mountAtlasValidationResults',
    'table': 'mountAtlasTable', // Note: mountAtlasTable function name kept as-is per user request
    'grid': 'mountAtlasGrid',
    'textarea': 'mountAtlasTextarea',
    'card': 'mountAtlasCard',
    'typography': 'mountAtlasTypography',
    'modal': 'mountAtlasModal',
    'listBox': 'mountAtlasListBox',
    'imageButton': 'mountAtlasImageButton',
    'agGrid': 'mountAtlasAgGrid',
    'dynamicForm': 'mountAtlasDynamicFormGenerator',
    'questionnairePreview': 'mountAtlasQuestionnairePreview',
    'questionnaireTable': 'mountQuestionnaireTable',
    'versionsTable': 'mountVersionsTable',
    'buttonGroup': 'mountAtlasButtonGroup',
    'divWrapper': 'mountAtlasDivWrapper',
    'drawer': 'mountAtlasDrawer',
    'textEditor': 'mountAtlasTextEditor',
    'loader': 'mountAtlasLoader',
    'toast': 'mountAtlasToast',
    'statusIndicator': 'mountAtlasStatusIndicator',
    'sidebar': 'mountAtlasSidebar',
    'header': 'mountAtlasHeader',
    'controlSearch': 'mountAtlasControlSearch',
    'RefDomainManager': 'mountRefDomainManager',
    'workflowGridManager': 'mountWorkflowGridManager',
    'workflowGrid': 'mountWorkflowGrid',
    'refcode-attributes-manager': 'mountRefCodeAttributesManager',
    'successMessage': 'mountAtlasSuccessMessage',
    'editAssignment': 'mountAtlasEditAssignment',
    'assignmentMove': 'mountAtlasAssignmentMove',
    'related-data-def-manager': 'mountRelatedDataDefManager',
    'workItemHeader': 'mountWorkItemHeader',
    'workItemDetailsCards': 'mountWorkItemDetailsCards',
    'workItemAttachmentModal': 'mountWorkItemAttachmentModal',
    'sendTestEmailDrawer': 'mountSendTestEmailDrawer',
    'addCustomNotificationDrawer': 'mountAddCustomNotificationDrawer',
    'editContentDrawer': 'mountEditContentDrawer',
    'workflowDefCloneDrawer': 'mountWorkflowDefCloneDrawer',
    'atlasConfirmDialogue': 'mountAtlasConfirmDialogue',
    'skeleton': 'mountAtlasSkeleton',
    'atlasSkeleton': 'mountAtlasSkeleton',
    'WorkQueueTables': 'mountWorkQueueTables'
  };
  // Make type lookup case-insensitive
  const typeKey = Object.keys(mountFunctionMap).find(k => k.toLowerCase() === String(type).toLowerCase());
  const functionName = typeKey ? mountFunctionMap[typeKey] : undefined;
  const mountFunction = functionName && window.Atlas && window.Atlas[functionName];
  if (!mountFunction) {
    if (window.AtlasLogger) {
      window.AtlasLogger.log('function name', functionName, window.Atlas, window.Atlas[functionName], mountFunction);
      window.AtlasLogger.log('Available Atlas functions:', Object.keys(window.Atlas || {}));
      window.AtlasLogger.log('Looking for function:', functionName);
    }
    
    // Enhanced debugging and fallback logic
    // Try alternative lookup methods
    let fallbackFunction = null;
    
    // Method 1: Try direct window lookup
    if (window[functionName]) {
        fallbackFunction = window[functionName];
        if (window.AtlasLogger) {
          window.AtlasLogger.log('Found function on window object:', functionName);
        }
    }
  
  // Method 2: Try case-insensitive lookup in Atlas
  if (!fallbackFunction && window.Atlas) {
    const atlasKeys = Object.keys(window.Atlas);
    const matchingKey = atlasKeys.find(key => {
      if (typeof key === 'string' && typeof functionName === 'string') {
        return key.toLowerCase() === functionName.toLowerCase();
      }
      return false;
    });
    if (matchingKey) {
      fallbackFunction = window.Atlas[matchingKey];
      if (window.AtlasLogger) {
        window.AtlasLogger.log('Found function with case mismatch:', matchingKey);
      }
    }
  }
  
  // Method 3: Try without "mountAtlas" prefix
  if (!fallbackFunction && window.Atlas && typeof functionName === 'string') {
    const shortName = functionName.replace('mountAtlas', '');
    const atlasKeys = Object.keys(window.Atlas);
    const matchingKey = atlasKeys.find(key => 
      typeof key === 'string' && key.toLowerCase().includes(shortName.toLowerCase())
    );
    if (matchingKey) {
      fallbackFunction = window.Atlas[matchingKey];
      if (window.AtlasLogger) {
        window.AtlasLogger.log('Found function with alternative name:', matchingKey);
      }
    }
  }
    
    // Use fallback function if found
    if (fallbackFunction && typeof fallbackFunction === 'function') {
        if (window.AtlasLogger) {
          window.AtlasLogger.log('Using fallback function for:', type);
        }
        // Validate id before calling fallback function
        if (!id || typeof id !== 'string' || id.trim() === '') {
            const errorMsg = `[Atlas] Invalid ID parameter for type "${type}" (fallback): ${id}`;
            window.AtlasLogger.log(errorMsg);
            console.error(errorMsg, { type, id, config, functionName });
            return false;
        }
        try {
            fallbackFunction(id, config, options);
            window.AtlasLogger.logComponentMount(type, id, config);
            return true;
        } catch (error) {
            window.AtlasLogger.logComponentError(type, id, error);
            console.error('[Atlas] Error mounting component (fallback):', { type, id, functionName, error });
            return false;
        }
    }
    
    // If no fallback found, log comprehensive error
    window.AtlasLogger.log(`⚠️ No mounting function found for type: ${type}`);
    window.AtlasLogger.log(`❌ Attempted function name: ${functionName}`);
    window.AtlasLogger.log(`📋 Available functions:`, Object.keys(window.Atlas || {}));
    return false;
  }
  // Validate id before calling mount function
  if (!id || typeof id !== 'string' || id.trim() === '') {
    const errorMsg = `[Atlas] Invalid ID parameter for type "${type}": ${id}`;
    window.AtlasLogger.log(errorMsg);
    console.error(errorMsg, { type, id, config });
    return false;
  }
  
  try {
    if (window.AtlasLogger) {
      window.AtlasLogger.log('Calling mountFunction:', { functionName, id, idType: typeof id, idValue: id, options });
    }
    mountFunction(id, config, options);
    window.AtlasLogger.logComponentMount(type, id, config);
    return true;
  } catch (error) {
    window.AtlasLogger.logComponentError(type, id, error);
    console.error('[Atlas] Error mounting component:', { type, id, functionName, error });
    return false;
  }
};

// Mount multiple React components in bulk
window.mountReactComponentIfExistsBulk = function(components) {
  if (!Array.isArray(components)) {
    window.AtlasLogger.log('⚠️ mountReactComponentIfExistsBulk: Expected an array of components.');
    return { success: [], failed: [] };
  }
  window.AtlasLogger.log(`🔄 Starting bulk mount of ${components.length} components`);
  const results = { success: [], failed: [] };
  components.forEach(function(c, index) {
    if (!c.type || !c.id || !c.config) {
      window.AtlasLogger.log(`⚠️ Skipping invalid component at index ${index}`, c);
      results.failed.push({ index, component: c, reason: 'Invalid component object' });
      return;
    }
    const success = window.mountReactComponentIfExists(c.type, c.id, c.config, c.options);
    if (success) {
      results.success.push({ index, component: c });
    } else {
      results.failed.push({ index, component: c, reason: 'Mounting failed' });
    }
  });
  window.AtlasLogger.log(`✅ Bulk mount completed: ${results.success.length} success, ${results.failed.length} failed`);
  return results;
};

// ===============================
// Atlas Bundle Loading Detection
// ===============================

window.detectAtlasBundleLoaded = function() {
  const checkInterval = setInterval(() => {
    if (window.Atlas) {
      clearInterval(checkInterval);
      window.AtlasLogger.logBundleLoaded();
      setTimeout(() => {
        window.AtlasLogger.printStats();
      }, 100);
    }
  }, 50);
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!window.Atlas) {
      window.AtlasLogger.log('❌ Atlas bundle failed to load within 10 seconds');
    }
  }, 10000);
};

// Auto-detect bundle loading
window.detectAtlasBundleLoaded();

// ===============================
// Loader Utilities & Skeleton Type Map
// ===============================

if (typeof window !== 'undefined') {
  // Remove skeleton loader from a container
  window.removeAtlasLoader = function(containerId) {
    var el = document.getElementById(containerId);
    window.AtlasLogger.log('removeAtlasLoader called for ' + containerId + ' found: ' + !!el, el);
    if (el) {
      el.removeAttribute('data-skeleton');
    }
  };

  // Central skeleton type map for Atlas components
  window.AtlasSkeletonTypeMap = {
    AtlasDynamicFormGenerator: 'dynamicForm',
    QuestionnairePreview: 'dynamicForm',
    AtlasButton: 'button',
    AtlasButtonGroup: 'buttonGroup',
    AtlasInput: 'input',
    AtlasTable: 'table',
    AtlasDropdown: 'input',
    AtlasSelect: 'input',
    AtlasRadioGroup: 'input',
    AtlasFileUpload: 'input',
    AtlasTextarea: 'input',
    AtlasCheckbox: 'input',
    AtlasCard: 'card',
    AtlasModal: 'card',
    AtlasGrid: 'table',
    AtlasValidationResults: 'table',
    AtlasTypography: 'input',
    AtlasListBox: 'input',
    AtlasImageButton: 'button',
    AtlasAgGrid: 'table',
    AtlasAccordion: 'card',
    AtlasAlert: 'card',
    AtlasDrawer: 'card',
    AtlasLoader: 'spinner',
    AtlasSkeleton: 'table',
    AtlasEditAssignment: 'card'
  };

  // Global AtlasSkeleton utility functions
  window.AtlasSkeleton = {
    // Show skeleton for any element
    show: function(elementId, skeletonType, options) {
      var element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
      if (!element) {
        console.warn('AtlasSkeleton: Element not found:', elementId);
        return false;
      }
      
      var skeletonOptions = options || {};
      var type = skeletonType || 'table';
      var duration = skeletonOptions.duration || 0; // 0 = manual removal
      var message = skeletonOptions.message || '';
      
      // Set skeleton attribute
      element.setAttribute('data-skeleton', type);
      
      // Add message if provided
      if (message) {
        element.setAttribute('data-skeleton-message', message);
      }
      
      // Auto-remove after duration if specified
      if (duration > 0) {
        setTimeout(() => {
          this.hide(elementId);
        }, duration);
      }
      
      return true;
    },
    
    // Hide skeleton for any element
    hide: function(elementId) {
      var element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
      if (!element) {
        console.warn('AtlasSkeleton: Element not found:', elementId);
        return false;
      }
      
      element.removeAttribute('data-skeleton');
      element.removeAttribute('data-skeleton-message');
      return true;
    },
    
    // Show skeleton with React component
    showReact: function(elementId, skeletonType, props) {
      var element = document.getElementById(elementId);
      if (!element) {
        console.warn('AtlasSkeleton: Element not found:', elementId);
        return false;
      }
      
      if (window.mountReactComponentIfExists) {
        window.mountReactComponentIfExists('atlasSkeleton', elementId, {
          variant: skeletonType || 'table',
          ...props
        });
        return true;
      }
      
      return false;
    },
    
    // Hide React skeleton
    hideReact: function(elementId) {
      if (window.Atlas && window.Atlas.unmount) {
        return window.Atlas.unmount(elementId);
      }
      return false;
    },
    
    // Show skeleton for multiple elements
    showMultiple: function(elements, skeletonType, options) {
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        results.push(this.show(elements[i], skeletonType, options));
      }
      return results;
    },
    
    // Hide skeleton for multiple elements
    hideMultiple: function(elements) {
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        results.push(this.hide(elements[i]));
      }
      return results;
    },
    
    // Show skeleton with loading message
    showWithMessage: function(elementId, skeletonType, message, duration) {
      return this.show(elementId, skeletonType, {
        message: message,
        duration: duration || 0
      });
    },
    
    // Show skeleton for table loading
    showTable: function(elementId, message, duration) {
      return this.showWithMessage(elementId, 'table', message, duration);
    },
    
    // Show skeleton for form loading
    showForm: function(elementId, message, duration) {
      return this.showWithMessage(elementId, 'dynamicForm', message, duration);
    },
    
    // Show skeleton for card loading
    showCard: function(elementId, message, duration) {
      return this.showWithMessage(elementId, 'card', message, duration);
    },
    
    // Show skeleton for button loading
    showButton: function(elementId, message, duration) {
      return this.showWithMessage(elementId, 'button', message, duration);
    },
    
    // Show skeleton for spinner loading
    showSpinner: function(elementId, message, duration) {
      return this.showWithMessage(elementId, 'spinner', message, duration);
    }
  };

  // Restore skeleton for a container based on component name
  window.restoreAtlasLoader = function(containerId, componentName) {
    var el = document.getElementById(containerId);
    if (el) {
      var skeletonType = (window.AtlasSkeletonTypeMap && window.AtlasSkeletonTypeMap[componentName]) || 'spinner';
      el.setAttribute('data-skeleton', skeletonType);
    }
  };
}


window.showAtlasModal = function(config) {
  // Create a temporary container if not present
  let modalContainer = document.getElementById('AtlasModalGlobalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'AtlasModalGlobalContainer';
    document.body.appendChild(modalContainer);
  }
  // Ensure open is true
  config = { ...config, open: true };
  // Provide a default onClose that unmounts the modal
  const cleanup = () => {
    if (window.ReactDOM && modalContainer) {
      window.ReactDOM.unmountComponentAtNode(modalContainer);
      // Optionally remove the container
      // modalContainer.remove();
    }
  };
  config.onClose = config.onClose || cleanup;
  if (window.Atlas && window.Atlas.AtlasModal) {
    window.Atlas.AtlasModal('AtlasModalGlobalContainer', config);
  }
  // Expose a hide function
  window.hideAtlasModal = cleanup;
};

// Mount AtlasDivWrapper utility
window.mountAtlasDivWrapper = function(id, config = {}) {
  if (!window.Atlas || !window.Atlas.mountAtlasDivWrapper) {
    window.AtlasLogger.log('❌ AtlasDivWrapper not available');
    return false;
  }
  try {
    window.Atlas.mountAtlasDivWrapper(id, config);
    window.AtlasLogger.logComponentMount('AtlasDivWrapper', id, config);
    return true;
  } catch (error) {
    window.AtlasLogger.logComponentError('AtlasDivWrapper', id, error);
    return false;
  }
};

window.updateAtlasGrid = function(containerId, newRowData, newColumnDefs, extraProps = {}) {
	const props = { rowData: newRowData, ...extraProps };
	if (newColumnDefs) props.columnDefs = newColumnDefs;

	if (window.Atlas && window.Atlas.mountAtlasAgGrid) {
		window.Atlas.mountAtlasAgGrid(containerId, props);
	} else if (window.mountReactComponentIfExists) {
		window.mountReactComponentIfExists('agGrid', containerId, props);
	} else {
		console.error('Atlas grid helpers not available');
	}
};
// ===============================
// End of componentUtils.js
// ===============================