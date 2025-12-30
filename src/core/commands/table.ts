import { EditorState, Selection, TextSelection } from 'prosemirror-state';
import { 
  addColumnAfter, 
  addColumnBefore, 
  deleteColumn, 
  addRowAfter, 
  addRowBefore, 
  deleteRow, 
  mergeCells, 
  splitCell, 
  deleteTable, 
  toggleHeaderRow, 
  toggleHeaderColumn, 
  toggleHeaderCell,
  goToNextCell,
  isInTable,
  selectedRect
} from 'prosemirror-tables';
import { Command } from 'prosemirror-state';

/**
 * Creates a table with the specified rows and columns.
 * Also ensures there is a paragraph after the table for easy exit.
 */
export const insertTable = (rows: number, cols: number): Command => {
  return (state, dispatch) => {
    const { schema, selection } = state;
    const { table, table_row, table_cell, paragraph } = schema.nodes;

    if (!table || !table_row || !table_cell) return false;

    const rowNodes = [];
    const totalWidth = 720; // Matches internal canvas width (800 - 80 padding)
    const colWidth = Math.floor(totalWidth / cols);
    
    for (let i = 0; i < rows; i++) {
      const cellNodes = [];
      for (let j = 0; j < cols; j++) {
        // Initializing with pixel widths helps prosemirror-tables resizing 
        // feel more stable and prevents layout jumps on the first hover.
        cellNodes.push(table_cell.createAndFill({ colwidth: [colWidth] }, paragraph.createAndFill()));
      }
      rowNodes.push(table_row.create(null, cellNodes));
    }

    const tableNode = table.create(null, rowNodes);

    if (dispatch) {
      let tr = state.tr;
      const { $from } = selection;
      
      // If we are in an empty paragraph at the top level, replace it
      if ($from.parent.type.name === 'paragraph' && $from.parent.content.size === 0 && $from.depth === 1) {
        tr.replaceWith($from.before(), $from.after(), tableNode);
      } else {
        tr.replaceSelectionWith(tableNode);
      }

      // Find the position of the newly inserted table
      // Since replaceSelectionWith might have moved things, we use mapping or search
      const mapping = tr.mapping;
      const maybeTablePos = mapping.map(selection.from);
      
      // We need to find where the table node actually is to add the paragraph after it
      // Let's look around the maybeTablePos
      let tablePos = maybeTablePos;
      let insertedNode = tr.doc.nodeAt(tablePos);
      
      // If it's not at tablePos, it might be at tablePos - 1 (shifted due to block structure)
      if (!insertedNode || insertedNode.type !== table) {
        if (tablePos > 0) {
          tablePos -= 1;
          insertedNode = tr.doc.nodeAt(tablePos);
        }
      }

      if (insertedNode && insertedNode.type === table) {
        const tableSize = insertedNode.nodeSize;
        const afterPos = tablePos + tableSize;

        // Ensure there's a paragraph after the table
        if (afterPos >= tr.doc.content.size || tr.doc.nodeAt(afterPos)?.type.name === 'table') {
          tr.insert(afterPos, paragraph.createAndFill()!);
        }

        // Ensure there's a paragraph before the table if it's at the very start
        if (tablePos === 0) {
          tr.insert(0, paragraph.createAndFill()!);
          // Adjust tablePos because we just inserted a paragraph (size usually 2)
          tablePos += tr.doc.nodeAt(0)!.nodeSize;
        }

        // Place selection inside the first cell of the table
        // tablePos + 1 (table) + 1 (row) + 1 (cell) + 1 (inner paragraph)
        // Resolving to the start of the first cell's content
        const firstCellContentPos = tablePos + 3; 
        if (firstCellContentPos < tr.doc.content.size) {
          tr.setSelection(Selection.near(tr.doc.resolve(firstCellContentPos)));
        }
      }
      
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
};

/**
 * Command to exit the table upwards from the first row.
 */
export const exitTableUp: Command = (state, dispatch) => {
  if (!isInTable(state)) return false;
  const rect = selectedRect(state);
  if (rect.top > 0) return false;

  const { $from } = state.selection;
  
  // Find cell depth
  let cellDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'table_cell' || $from.node(d).type.name === 'table_header') {
      cellDepth = d;
      break;
    }
  }
  if (cellDepth === -1) return false;

  // Only exit if at the very beginning of the first cell
  if ($from.index(cellDepth) > 0 || $from.parentOffset > 0) {
    return false;
  }

  // Find table node depth
  let tableDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'table') {
      tableDepth = d;
      break;
    }
  }
  if (tableDepth === -1) return false;

  if (dispatch) {
    const tablePos = $from.before(tableDepth);
    let tr = state.tr;
    // Check if there is already a paragraph before
    const $tablePos = tr.doc.resolve(tablePos);
    const nodeBefore = $tablePos.nodeBefore;

    if (!nodeBefore || nodeBefore.type.name !== 'paragraph') {
      const newPara = state.schema.nodes.paragraph.createAndFill()!;
      tr = tr.insert(tablePos, newPara);
      tr = tr.setSelection(TextSelection.create(tr.doc, tablePos + 1));
    } else {
      tr = tr.setSelection(Selection.near($tablePos, -1));
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
};

/**
 * Command to exit the table downwards from the last row.
 */
export const exitTableDown: Command = (state, dispatch) => {
  if (!isInTable(state)) return false;
  const rect = selectedRect(state);
  if (rect.bottom < rect.map.height) return false;

  const { $from } = state.selection;

  // Find cell depth
  let cellDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'table_cell' || $from.node(d).type.name === 'table_header') {
      cellDepth = d;
      break;
    }
  }
  if (cellDepth === -1) return false;

  // Only exit if at the very end of the last cell
  if ($from.indexAfter(cellDepth) < $from.node(cellDepth).childCount || 
      $from.parentOffset < $from.parent.content.size) {
    return false;
  }

  // Find table node depth
  let tableDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'table') {
      tableDepth = d;
      break;
    }
  }
  if (tableDepth === -1) return false;

  if (dispatch) {
    const tableEndPos = $from.after(tableDepth);
    let tr = state.tr;
    // Check if there is already a paragraph after
    const $tableEndPos = tr.doc.resolve(tableEndPos);
    const nodeAfter = $tableEndPos.nodeAfter;

    if (!nodeAfter || nodeAfter.type.name !== 'paragraph') {
      const newPara = state.schema.nodes.paragraph.createAndFill()!;
      tr = tr.insert(tableEndPos, newPara);
      tr = tr.setSelection(TextSelection.create(tr.doc, tableEndPos + 1));
    } else {
      tr = tr.setSelection(Selection.near($tableEndPos, 1));
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
};

/**
 * Table Commands Wrapper
 */
export const tableCommands = {
  insertTable,
  addColumnAfter,
  addColumnBefore,
  deleteColumn,
  addRowAfter,
  addRowBefore,
  deleteRow,
  mergeCells,
  splitCell,
  deleteTable,
  toggleHeaderRow,
  toggleHeaderColumn,
  toggleHeaderCell,
  nextCell: goToNextCell(1),
  prevCell: goToNextCell(-1),
  exitTableUp,
  exitTableDown,
};

/**
 * Smart tab command: moves to next cell or adds a new row if at the very end
 */
export const onTab = (direction: number): Command => {
  return (state, dispatch) => {
    if (!isInTable(state)) return false;
    
    if (direction === 1) {
      const rect = selectedRect(state);
      if (rect.bottom === rect.map.height && rect.right === rect.map.width) {
        return addRowAfter(state, dispatch);
      }
    }
    
    return goToNextCell(direction as 1 | -1)(state, dispatch);
  };
};

/**
 * Checks if the selection is inside a table
 */
export const isInsideTable = (state: EditorState): boolean => {
  return isInTable(state);
};

/**
 * Gets the current table selection info
 */
export const getTableSelectionInfo = (state: EditorState) => {
  if (!isInTable(state)) return null;
  
  const rect = selectedRect(state);
  return {
    rect,
    canMerge: mergeCells(state),
    canSplit: splitCell(state),
    canAddColumnBefore: addColumnBefore(state),
    canAddColumnAfter: addColumnAfter(state),
    canDeleteColumn: deleteColumn(state),
    canAddRowBefore: addRowBefore(state),
    canAddRowAfter: addRowAfter(state),
    canDeleteRow: deleteRow(state),
    canDeleteTable: deleteTable(state),
  };
};
