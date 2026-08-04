/* DevOps Academy Mermaid exporter
 * Adds transparent SVG and high-resolution PNG download controls to rendered
 * Mermaid diagrams. Exported SVG labels are converted to native SVG text for
 * PowerPoint compatibility, and connector labels receive a contrasting halo.
 */
(() => {
  'use strict';

  const MERMAID_SELECTOR = '.mermaid';
  const PNG_SCALE = 4;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  let scanTimer = null;
  let diagramCounter = 0;

  const PRESENTATION_PROPERTIES = [
    'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width',
    'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
    'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'color',
    'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant',
    'letter-spacing', 'word-spacing', 'text-anchor', 'dominant-baseline',
    'paint-order', 'stop-color', 'stop-opacity', 'marker-start', 'marker-mid',
    'marker-end'
  ];

  const normalizePaintServer = value => {
    if (!value || value === 'none') return value;
    return value.replace(/url\(["']?(?:[^"')]*#)([^"')]+)["']?\)/g, 'url(#$1)');
  };

  const meaningfulStyleValue = value => Boolean(value && value.trim() && value.trim() !== 'auto');

  const inlineComputedStyles = (sourceSvg, clonedSvg) => {
    const sourceElements = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
    const clonedElements = [clonedSvg, ...clonedSvg.querySelectorAll('*')];
    const count = Math.min(sourceElements.length, clonedElements.length);

    for (let index = 0; index < count; index += 1) {
      const source = sourceElements[index];
      const clone = clonedElements[index];
      let computed;
      try { computed = window.getComputedStyle(source); } catch (_) { continue; }

      PRESENTATION_PROPERTIES.forEach(property => {
        let value = computed.getPropertyValue(property);
        if (!meaningfulStyleValue(value)) return;
        value = normalizePaintServer(value.trim());
        try { clone.setAttribute(property, value); } catch (_) {}
      });

      if (source.tagName?.toLowerCase() === 'text') {
        const textFill = computed.getPropertyValue('fill');
        const textColor = computed.getPropertyValue('color');
        const resolved = meaningfulStyleValue(textFill) && textFill !== 'none' ? textFill : textColor;
        if (meaningfulStyleValue(resolved)) clone.setAttribute('fill', resolved.trim());
      }
    }
  };

  const normalizeExtractedLines = value => value
    .replace(/\u00a0/g, ' ')
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/[\t\f\v ]+/g, ' ').trim())
    .filter(Boolean);

  const explicitTextLines = element => {
    /* Preserve semantic breaks Mermaid emits as <br>, block wrappers, actual
     * newlines, or a literal two-character "\\n" sequence. */
    const copy = element.cloneNode(true);

    copy.querySelectorAll('br').forEach(br => {
      br.replaceWith(document.createTextNode('\n'));
    });

    copy.querySelectorAll('div, p, li').forEach(block => {
      block.appendChild(document.createTextNode('\n'));
    });

    let renderedText = '';
    try {
      renderedText = typeof element.innerText === 'string' ? element.innerText : '';
    } catch (_) {}

    const renderedLines = normalizeExtractedLines(renderedText);
    const clonedLines = normalizeExtractedLines(copy.textContent || '');

    return renderedLines.length > clonedLines.length ? renderedLines : clonedLines;
  };

  const visualTextLines = element => {
    /* Mermaid 11 can display a label on multiple lines through CSS wrapping
     * while leaving no <br> or newline in the DOM. Exporting textContent then
     * collapses it into one overflowing SVG line. Measure each rendered
     * character and group characters by their visual row so exported tspans
     * exactly follow the live diagram's line layout. */
    const tokens = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );
    let node = walker.currentNode;

    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName?.toLowerCase() === 'br') {
        tokens.push({ break: true });
      } else if (node.nodeType === Node.TEXT_NODE) {
        const value = (node.nodeValue || '').replace(/\u00a0/g, ' ');

        for (let index = 0; index < value.length; index += 1) {
          const character = value[index];

          if (character === '\\' && value[index + 1] === 'n') {
            tokens.push({ break: true });
            index += 1;
            continue;
          }

          if (character === '\n' || character === '\r') {
            tokens.push({ break: true });
            continue;
          }

          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = [...range.getClientRects()].find(candidate =>
            candidate.height > 0 && (candidate.width > 0 || !character.trim())
          );
          range.detach?.();

          tokens.push({
            character,
            rect: rect ? {
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              height: rect.height
            } : null
          });
        }
      }

      node = walker.nextNode();
    }

    const lines = [];
    let current = '';
    let rowCenter = null;
    let rowHeight = 0;

    const commit = () => {
      const normalized = current.replace(/[\t\f\v ]+/g, ' ').trim();
      if (normalized) lines.push(normalized);
      current = '';
      rowCenter = null;
      rowHeight = 0;
    };

    tokens.forEach(token => {
      if (token.break) {
        commit();
        return;
      }

      const character = token.character || '';
      if (!token.rect) {
        if (/\s/.test(character) && current && !current.endsWith(' ')) current += ' ';
        return;
      }

      const center = (token.rect.top + token.rect.bottom) / 2;
      const tolerance = Math.max(2, Math.min(rowHeight || token.rect.height, token.rect.height) * 0.42);

      if (rowCenter !== null && Math.abs(center - rowCenter) > tolerance) commit();

      if (rowCenter === null) {
        rowCenter = center;
        rowHeight = token.rect.height;
      } else {
        rowCenter = (rowCenter * Math.max(current.length, 1) + center) / (Math.max(current.length, 1) + 1);
        rowHeight = Math.max(rowHeight, token.rect.height);
      }

      current += character;
    });

    commit();
    return lines;
  };

  const elementTextLines = element => {
    const explicit = explicitTextLines(element);
    const visual = visualTextLines(element);

    /* Prefer the representation with more rows. This preserves explicit
     * breaks and also captures browser-created wrapping that innerText and
     * textContent do not expose. */
    return visual.length > explicit.length ? visual : explicit;
  };

  const numericAttribute = (element, name, fallback) => {
    const value = Number.parseFloat(element.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const replaceForeignObjects = (sourceSvg, clonedSvg) => {
    const sourceObjects = [...sourceSvg.querySelectorAll('foreignObject')];
    const clonedObjects = [...clonedSvg.querySelectorAll('foreignObject')];

    sourceObjects.forEach((sourceObject, index) => {
      const clonedObject = clonedObjects[index];
      if (!clonedObject?.parentNode) return;
      const labelElement =
        sourceObject.querySelector('.nodeLabel') ||
        sourceObject.querySelector('.edgeLabel') ||
        sourceObject.querySelector('.label') ||
        sourceObject.querySelector('span') ||
        sourceObject.querySelector('div') ||
        sourceObject;
      const lines = elementTextLines(labelElement);
      if (!lines.length) { clonedObject.remove(); return; }

      let box = null;
      try { box = sourceObject.getBBox(); } catch (_) {}
      /* Use the foreignObject viewport first. getBBox() can expand to the
       * overflowing HTML content in Chromium, which recenters a converted
       * one-line label outside its original Mermaid node. */
      const x = numericAttribute(sourceObject, 'x', box ? box.x : 0);
      const y = numericAttribute(sourceObject, 'y', box ? box.y : 0);
      const width = numericAttribute(sourceObject, 'width', box ? box.width : 1);
      const height = numericAttribute(sourceObject, 'height', box ? box.height : 1);
      const computed = window.getComputedStyle(labelElement);
      const fontSize = Number.parseFloat(computed.fontSize) || 14;
      const computedLineHeight = Number.parseFloat(computed.lineHeight);
      const lineHeight = Number.isFinite(computedLineHeight) && computedLineHeight > 0
        ? computedLineHeight
        : fontSize * 1.22;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const firstLineY = centerY - ((lines.length - 1) * lineHeight) / 2;
      const text = document.createElementNS(SVG_NS, 'text');
      const textColor = computed.color || computed.fill || '#111827';

      text.setAttribute('x', String(centerX));
      text.setAttribute('y', String(firstLineY));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', textColor);
      text.setAttribute('font-family', computed.fontFamily || 'Arial, Helvetica, sans-serif');
      text.setAttribute('font-size', String(fontSize));
      text.setAttribute('font-weight', computed.fontWeight || '400');
      text.setAttribute('font-style', computed.fontStyle || 'normal');
      text.setAttribute('class', 'devops-exported-mermaid-label');

      lines.forEach((line, lineIndex) => {
        const tspan = document.createElementNS(SVG_NS, 'tspan');
        tspan.setAttribute('x', String(centerX));
        tspan.setAttribute('y', String(firstLineY + lineIndex * lineHeight));
        tspan.textContent = line;
        text.appendChild(tspan);
      });

      clonedObject.parentNode.replaceChild(text, clonedObject);
    });
  };

  const parseViewBox = (svg, rect) => {
    const raw = svg.getAttribute('viewBox');
    if (raw) {
      const parts = raw.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        return { x: parts[0], y: parts[1], width: Math.max(parts[2], 1), height: Math.max(parts[3], 1) };
      }
    }
    const width = Number.parseFloat(svg.getAttribute('width')) || rect.width || svg.clientWidth || 1;
    const height = Number.parseFloat(svg.getAttribute('height')) || rect.height || svg.clientHeight || 1;
    return { x: 0, y: 0, width, height };
  };

  const normalizeExportedEdgeLabels = clonedSvg => {
    const selector = [
      '.edgeLabel text', '.edgeLabels text', 'text.edgeLabel',
      '.edgeLabel .devops-exported-mermaid-label',
      '.edgeLabels .devops-exported-mermaid-label'
    ].join(', ');

    clonedSvg.querySelectorAll(selector).forEach(textElement => {
      [textElement, ...textElement.querySelectorAll('tspan')].forEach(part => {
        part.setAttribute('fill', '#111827');
        part.setAttribute('color', '#111827');
        part.setAttribute('stroke', '#ffffff');
        part.setAttribute('stroke-opacity', '0.98');
        part.setAttribute('stroke-width', '2.4');
        part.setAttribute('stroke-linejoin', 'round');
        part.setAttribute('paint-order', 'stroke fill');
      });
    });
  };

  const buildStandaloneSvg = (sourceSvg, mermaidElement) => {
    const rect = sourceSvg.getBoundingClientRect();
    const box = parseViewBox(sourceSvg, rect);
    const clone = sourceSvg.cloneNode(true);

    inlineComputedStyles(sourceSvg, clone);
    replaceForeignObjects(sourceSvg, clone);
    normalizeExportedEdgeLabels(clone);
    clone.querySelectorAll('style, script').forEach(element => element.remove());

    clone.setAttribute('xmlns', SVG_NS);
    clone.setAttribute('xmlns:xlink', XLINK_NS);
    clone.setAttribute('version', '1.1');
    clone.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    clone.setAttribute('width', String(box.width));
    clone.setAttribute('height', String(box.height));
    clone.setAttribute('shape-rendering', 'geometricPrecision');
    clone.setAttribute('text-rendering', 'geometricPrecision');
    clone.setAttribute('style', 'background:transparent;background-color:transparent;overflow:visible');
    clone.querySelectorAll('.background, .mermaid-export-background').forEach(element => {
      element.setAttribute('fill', 'none');
      element.setAttribute('fill-opacity', '0');
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
    return { xml, width: box.width, height: box.height, source: mermaidElement };
  };

  const safeFilename = value => value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ').trim().replace(/[. ]+$/g, '').slice(0, 120) || 'mermaid-diagram';

  const diagramFilename = (element, extension) => {
    const section = element.closest('section');
    const heading = section?.querySelector('h1, h2, h3, h4');
    const title = heading?.textContent.trim() || document.title.trim();
    const index = element.dataset.devopsMermaidExportIndex || '1';
    return `${safeFilename(`${title} - diagram ${index}`)}.${extension}`;
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const svgToPng = (exported, filename) => new Promise((resolve, reject) => {
    const svgBlob = new Blob([exported.xml], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = Math.max(1, Math.ceil(exported.width * PNG_SCALE));
        const height = Math.max(1, Math.ceil(exported.height * PNG_SCALE));
        if (width * height > 120000000) throw new Error('The 4× PNG exceeds the browser canvas limit. Save as SVG instead.');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
        context.clearRect(0, 0, width, height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(svgUrl);
          if (!blob) { reject(new Error('The browser could not create the PNG file.')); return; }
          triggerDownload(blob, filename);
          resolve();
        }, 'image/png', 1);
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('The diagram could not be rasterized.'));
    };
    image.src = svgUrl;
  });

  const setButtonState = (button, state, temporaryLabel) => {
    const label = button.querySelector('.devops-mermaid-export-btn__label');
    const original = button.dataset.originalLabel || label?.textContent;
    if (original) button.dataset.originalLabel = original;
    button.classList.remove('is-busy', 'is-success', 'is-error');
    button.disabled = false;
    if (state === 'busy') { button.classList.add('is-busy'); button.disabled = true; }
    if (state === 'success') button.classList.add('is-success');
    if (state === 'error') button.classList.add('is-error');
    if (label && temporaryLabel) label.textContent = temporaryLabel;
    if (state === 'success' || state === 'error') {
      setTimeout(() => {
        button.classList.remove('is-success', 'is-error');
        if (label && button.dataset.originalLabel) label.textContent = button.dataset.originalLabel;
      }, 1800);
    }
  };

  const exportDiagram = (element, format, button) => {
    const svg = element.querySelector('svg');
    if (!svg) { setButtonState(button, 'error', 'Not ready'); return; }
    setButtonState(button, 'busy', 'Working');
    try {
      const exported = buildStandaloneSvg(svg, element);
      if (format === 'svg') {
        triggerDownload(new Blob([exported.xml], { type: 'image/svg+xml;charset=utf-8' }), diagramFilename(element, 'svg'));
        setButtonState(button, 'success', 'Saved');
        return;
      }
      svgToPng(exported, diagramFilename(element, 'png'))
        .then(() => setButtonState(button, 'success', 'Saved'))
        .catch(error => {
          console.error('DevOps Academy: Mermaid PNG export failed.', error);
          setButtonState(button, 'error', 'Failed');
        });
    } catch (error) {
      console.error('DevOps Academy: Mermaid export failed.', error);
      setButtonState(button, 'error', 'Failed');
    }
  };

  const createButton = (format, element) => {
    const button = document.createElement('button');
    const label = format.toUpperCase();
    button.type = 'button';
    button.className = 'devops-mermaid-export-btn';
    button.setAttribute('aria-label', `Save diagram as ${label}`);
    button.setAttribute('title', `Save as ${label}${format === 'png' ? ' (4×)' : ''}`);
    button.innerHTML = '<span class="devops-mermaid-export-btn__icon" aria-hidden="true">↓</span>' +
      `<span class="devops-mermaid-export-btn__label">${label}</span>`;
    button.addEventListener('click', () => exportDiagram(element, format, button));
    return button;
  };

  const ensureHost = element => {
    let host = element.closest('.diagram-card');
    const dedicated = !host || host.querySelectorAll(MERMAID_SELECTOR).length > 1;
    if (dedicated) {
      host = document.createElement('div');
      host.className = 'devops-mermaid-export-frame';
      element.parentNode.insertBefore(host, element);
      host.appendChild(element);
    }
    host.classList.add('devops-mermaid-export-host');
    return host;
  };

  const mountControls = element => {
    if (!element.dataset.devopsMermaidExportIndex) {
      diagramCounter += 1;
      element.dataset.devopsMermaidExportIndex = String(diagramCounter);
    }
    const host = ensureHost(element);
    let controls = host.querySelector(':scope > .devops-mermaid-export-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'devops-mermaid-export-controls';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Diagram downloads');
      controls.append(createButton('svg', element), createButton('png', element));
      host.insertBefore(controls, host.firstChild);
    }
    const ready = Boolean(element.querySelector('svg'));
    controls.querySelectorAll('button').forEach(button => {
      if (!button.classList.contains('is-busy')) button.disabled = !ready;
    });
  };

  const scan = () => document.querySelectorAll(MERMAID_SELECTOR).forEach(mountControls);
  const scheduleScan = (delay = 40) => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, delay);
  };

  const initialize = () => {
    scan();
    if (document.body && typeof MutationObserver === 'function') {
      const observer = new MutationObserver(mutations => {
        if (mutations.some(mutation => mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length))) {
          scheduleScan();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('load', () => scheduleScan(160), { once: true });
    window.addEventListener('devops-mermaid-rendered', () => scheduleScan(20));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
