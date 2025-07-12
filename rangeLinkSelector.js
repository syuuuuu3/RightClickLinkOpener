(function() {
  'use strict';
  
  // Range selection state management
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let selectionBox = null;
  let highlightedLinks = new Set();
  
  // Selection box styling
  const SELECTION_BOX_STYLE = {
    position: 'fixed',
    border: '2px dashed #007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    pointerEvents: 'none',
    zIndex: '999999',
    display: 'none'
  };
  
  // Link highlight styling
  const LINK_HIGHLIGHT_STYLE = {
    outline: '2px solid #ff4444',
    outlineOffset: '2px',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    transition: 'all 0.2s ease'
  };
  
  // Create selection box
  function createSelectionBox() {
    const box = document.createElement('div');
    box.id = 'rangeLinkSelector-box';
    Object.assign(box.style, SELECTION_BOX_STYLE);
    document.body.appendChild(box);
    return box;
  }
  
  // Update selection box position and size
  function updateSelectionBox(startX, startY, currentX, currentY) {
    if (!selectionBox) return;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    selectionBox.style.display = 'block';
  }
  
  // Get links within the selected range
  function getLinksInRange(startX, startY, endX, endY) {
    const links = [];
    const allLinks = document.querySelectorAll('a[href], area[href]');
    
    const selectionRect = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      right: Math.max(startX, endX),
      bottom: Math.max(startY, endY)
    };
    
    allLinks.forEach(link => {
      const rect = link.getBoundingClientRect();
      
      // Check if the link's bounding box overlaps with the selection range
      if (rect.left < selectionRect.right &&
          rect.right > selectionRect.left &&
          rect.top < selectionRect.bottom &&
          rect.bottom > selectionRect.top) {
        
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          // Convert relative URLs to absolute URLs
          const absoluteUrl = new URL(href, window.location.href).href;
          links.push({
            element: link,
            url: absoluteUrl
          });
        }
      }
    });
    
    return links;
  }
  
  // Highlight links within the selection
  function highlightLinks(links) {
    clearHighlights();
    
    links.forEach(linkData => {
      const link = linkData.element;
      
      // Save original styles
      link.dataset.originalOutline = link.style.outline || '';
      link.dataset.originalOutlineOffset = link.style.outlineOffset || '';
      link.dataset.originalBackgroundColor = link.style.backgroundColor || '';
      link.dataset.originalTransition = link.style.transition || '';
      
      // Apply highlight styles
      Object.assign(link.style, LINK_HIGHLIGHT_STYLE);
      
      highlightedLinks.add(link);
    });
  }
  
  // Clear link highlights
  function clearHighlights() {
    highlightedLinks.forEach(link => {
      // Restore original styles
      link.style.outline = link.dataset.originalOutline || '';
      link.style.outlineOffset = link.dataset.originalOutlineOffset || '';
      link.style.backgroundColor = link.dataset.originalBackgroundColor || '';
      link.style.transition = link.dataset.originalTransition || '';
      
      // Remove data attributes
      delete link.dataset.originalOutline;
      delete link.dataset.originalOutlineOffset;
      delete link.dataset.originalBackgroundColor;
      delete link.dataset.originalTransition;
    });
    
    highlightedLinks.clear();
  }
  
  // Start range selection
  function startSelection(e) {
    if (!e.altKey) return;
    
    e.preventDefault();
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    
    if (!selectionBox) {
      selectionBox = createSelectionBox();
    }
    
    updateSelectionBox(startX, startY, startX, startY);
    
    // Change cursor style
    document.body.style.cursor = 'crosshair';
  }
  
  // Update selection during drag
  function updateSelection(e) {
    if (!isSelecting) return;
    
    e.preventDefault();
    updateSelectionBox(startX, startY, e.clientX, e.clientY);
    
    // Highlight links in real-time
    const links = getLinksInRange(startX, startY, e.clientX, e.clientY);
    highlightLinks(links);
  }
  
  // End range selection
  function endSelection(e) {
    if (!isSelecting) return;
    
    e.preventDefault();
    isSelecting = false;
    
    // Restore cursor style
    document.body.style.cursor = '';
    
    // Hide selection box
    if (selectionBox) {
      selectionBox.style.display = 'none';
    }
    
    // Get links within the selected range
    const links = getLinksInRange(startX, startY, e.clientX, e.clientY);
    
    if (links.length === 0) {
      clearHighlights();
      console.log('No links found in the selected range');
      return;
    }
    
    if (links.length > 10) {
      clearHighlights();
      alert(`Found ${links.length} links. For safety, only ranges with 10 or fewer links will be processed.`);
      return;
    }
    
    // Wait briefly before opening links (to allow users to see the highlights)
    setTimeout(() => {
      const urls = links.map(link => link.url);
      console.log(`Opening ${urls.length} links:`, urls);
      
      // Send message to background script
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'openLinks',
          urls: urls
        }).catch(error => {
          console.error('Failed to send message to background script:', error);
          // Fallback: open links directly if background script fails
          openLinksDirectly(urls);
        });
      } else {
        console.warn('Chrome runtime not available, opening links directly');
        openLinksDirectly(urls);
      }
      
      clearHighlights();
    }, 500);
  }
  
  // Fallback function to open links directly
  function openLinksDirectly(urls) {
    urls.forEach(url => {
      try {
        window.open(url, '_blank');
      } catch (error) {
        console.error('Failed to open URL:', url, error);
      }
    });
  }
  
  // Handle keyboard events
  function handleKeyDown(e) {
    if (e.key === 'Escape' && isSelecting) {
      // Cancel selection with Escape key
      isSelecting = false;
      document.body.style.cursor = '';
      if (selectionBox) {
        selectionBox.style.display = 'none';
      }
      clearHighlights();
    }
  }
  
  // Check if extension environment is available
  function checkExtensionEnvironment() {
    if (!chrome || !chrome.runtime) {
      console.warn('Chrome extension runtime not available. The extension may not work properly.');
      return false;
    }
    return true;
  }
  
  // Initialize extension
  checkExtensionEnvironment();
  
  // Add event listeners
  document.addEventListener('mousedown', startSelection);
  document.addEventListener('mousemove', updateSelection);
  document.addEventListener('mouseup', endSelection);
  document.addEventListener('keydown', handleKeyDown);
  
  // Clear highlights when page becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearHighlights();
    }
  });
  
  // Cleanup on extension unload
  window.addEventListener('beforeunload', () => {
    clearHighlights();
    if (selectionBox) {
      selectionBox.remove();
    }
  });
  
  console.log('Range Link Selector loaded. Hold Alt and click-drag to select a range.');
  
  // Log extension status
  if (checkExtensionEnvironment()) {
    console.log('Chrome extension environment detected - background tabs supported');
  } else {
    console.log('Fallback mode - links will open in new tabs via window.open');
  }
})();