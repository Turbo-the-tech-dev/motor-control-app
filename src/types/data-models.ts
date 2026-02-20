// Data Models for Ladder Logic Elements

// Core Data Types
export type UUID = string;
export type GridUnit = number;

// Position and Geometry
export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridPosition extends Rectangle {
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
}

// Component Addressing System
export interface Address {
  type: 'internal' | 'input' | 'output' | 'timer' | 'counter';
  number: number;
  bit?: number; // For word addressing (e.g., T0:1)
}

export interface AddressReference {
  address: string;
  description?: string;
  dataType: 'bool' | 'int' | 'real' | 'timer' | 'counter';
}

// Ladder Diagram Structure
export interface LadderDiagram {
  id: UUID;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  modifiedAt: Date;
  author?: string;
  metadata: DiagramMetadata;
  powerRails: PowerRail[];
  rungs: LadderRung[];
  comments: DiagramComment[];
  tags: string[];
}

export interface DiagramMetadata {
  projectName?: string;
  customerName?: string;
  panelNumber?: string;
  voltage: VoltageInfo;
  standards: ComplianceStandard[];
  revisionHistory: Revision[];
  customProperties: Record<string, any>;
}

export interface VoltageInfo {
  systemVoltage: string;
  controlVoltage: string;
  frequency?: string;
  phases: 1 | 3;
  grounding: 'solid' | 'impedance' | 'ungrounded';
}

export interface ComplianceStandard {
  name: string;
  version?: string;
  notes?: string;
}

export interface Revision {
  id: UUID;
  version: string;
  date: Date;
  author: string;
  changes: string;
  approved?: boolean;
}

// Power Rails
export interface PowerRail {
  id: UUID;
  type: 'left' | 'right' | 'center';
  position: GridPosition;
  voltage: string;
  phase?: string;
  color: string;
  terminals: PowerRailTerminal[];
  visible: boolean;
  label?: string;
}

export interface PowerRailTerminal {
  id: UUID;
  position: Point; // Relative to rail
  type: 'output' | 'input';
  connected: boolean;
  wireNumber?: string;
}

// Ladder Rungs
export interface LadderRung {
  id: UUID;
  number: number;
  label?: string;
  description?: string;
  elements: LadderElement[];
  connections: Connection[];
  comments: RungComment[];
  condition: RungCondition;
  isActive: boolean;
}

export interface RungCondition {
  type: 'normal' | 'conditional' | 'subroutine';
  condition?: string; // Expression for conditional rungs
  subroutineId?: UUID; // For subroutine calls
}

// Ladder Elements
export interface LadderElement {
  id: UUID;
  type: ComponentType;
  subtype?: string; // For variants like different timer types
  position: GridPosition;
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
  properties: ComponentProperties;
  state: ElementState;
  addressing: ElementAddressing;
  documentation: ElementDocumentation;
  validation: ValidationResult;
}

export interface ComponentProperties {
  // Common properties
  label: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  rating?: ComponentRating;
  
  // Type-specific properties (dynamic based on component type)
  [key: string]: any;
}

export interface ComponentRating {
  voltage: string;
  current: string;
  power?: string;
  dutyCycle?: number;
  category: 'control' | 'power' | 'signal';
}

export interface ElementState {
  energized: boolean;
  value?: boolean | number;
  timerValue?: number;
  counterValue?: number;
  errorState?: boolean;
  warningState?: boolean;
  lastUpdated: number;
  forced?: boolean;
  forceValue?: boolean | number;
}

export interface ElementAddressing {
  primaryAddress?: AddressReference;
  secondaryAddresses?: AddressReference[];
  aliasAddresses?: string[];
  ioModule?: IOModuleReference;
}

export interface IOModuleReference {
  moduleId: UUID;
  slot: number;
  channel: number;
  moduleType: 'input' | 'output' | 'analog_input' | 'analog_output';
}

export interface ElementDocumentation {
  purpose: string;
  operation: string;
  notes?: string;
  crossReferences: CrossReference[];
  maintenanceNotes?: string;
}

export interface CrossReference {
  elementId: UUID;
  type: 'control' | 'feedback' | 'interlock';
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastChecked: number;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error';
  elementId?: UUID;
  connectionId?: UUID;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'warning';
  elementId?: UUID;
  connectionId?: UUID;
}

// Connections
export interface Connection {
  id: UUID;
  from: ConnectionEndpoint;
  to: ConnectionEndpoint;
  path: ConnectionPath;
  wireNumber?: string;
  color?: string;
  gauge?: WireGauge;
  properties: ConnectionProperties;
  validation: ConnectionValidation;
}

export interface ConnectionEndpoint {
  elementId: UUID;
  terminalId: string;
  terminalType: TerminalType;
  position: Point;
}

export interface ConnectionPath {
  type: 'orthogonal' | 'direct' | 'manhattan';
  points: Point[];
  style: 'solid' | 'dashed' | 'dotted';
}

export interface ConnectionProperties {
  label?: string;
  description?: string;
  isCritical: boolean;
  wireLength?: number;
  voltageDrop?: number;
}

export interface ConnectionValidation {
  isComplete: boolean;
  hasShortCircuit: boolean;
  hasOpenCircuit: boolean;
  issues: string[];
}

// Comments and Documentation
export interface DiagramComment {
  id: UUID;
  position: GridPosition;
  text: string;
  type: 'general' | 'warning' | 'note';
  author?: string;
  createdAt: Date;
  visible: boolean;
}

export interface RungComment {
  id: UUID;
  position: 'above' | 'below' | 'left' | 'right';
  text: string;
  type: 'description' | 'note' | 'warning';
  visible: boolean;
}

// Component Type Definitions
export type ComponentType = 
  // Contacts
  | 'contact_no'
  | 'contact_nc'
  | 'contact_pos'
  | 'contact_neg'
  | 'contact_edge_rising'
  | 'contact_edge_falling'
  
  // Coils and Outputs
  | 'coil'
  | 'coil_latch'
  | 'coil_unlatch'
  | 'coil_one_shot'
  | 'output_pulse'
  
  // Timers
  | 'timer_on_delay'
  | 'timer_off_delay'
  | 'timer_retentive'
  | 'timer_one_shot'
  
  // Counters
  | 'counter_up'
  | 'counter_down'
  | 'counter_up_down'
  | 'counter_high_speed'
  
  // Protection Devices
  | 'overload_thermal'
  | 'overload_magnetic'
  | 'circuit_breaker'
  | 'fuse'
  | 'emergency_stop'
  
  // Pilot Devices
  | 'pilot_light'
  | 'beeper'
  | 'horn'
  | 'push_button'
  | 'selector_switch'
  | 'toggle_switch'
  | 'limit_switch'
  | 'pressure_switch'
  | 'temperature_switch'
  | 'level_switch'
  
  // Power Components
  | 'motor_starter'
  | 'contactor'
  | 'relay'
  | 'transformer'
  | 'power_supply'
  
  // Logic Functions
  | 'compare_equal'
  | 'compare_not_equal'
  | 'compare_greater'
  | 'compare_less'
  | 'math_add'
  | 'math_subtract'
  | 'math_multiply'
  | 'math_divide'
  | 'move'
  | 'convert'
  
  // Communication
  | 'message_read'
  | 'message_write'
  | 'pid_control'
  
  // Structure Elements
  | 'subroutine_call'
  | 'jump'
  | 'label'
  | 'return'
  
  // Special
  | 'power_rail'
  | 'conductor'
  | 'junction'
  | 'ground';

export type TerminalType = 
  | 'left_input'
  | 'left_output'
  | 'right_input'
  | 'right_output'
  | 'top_input'
  | 'top_output'
  | 'bottom_input'
  | 'bottom_output'
  | 'enable'
  | 'reset'
  | 'preset';

export type WireGauge = 
  | '18 AWG' | '16 AWG' | '14 AWG' | '12 AWG' | '10 AWG' 
  | '8 AWG' | '6 AWG' | '4 AWG' | '2 AWG' | '1 AWG' 
  | '1/0 AWG' | '2/0 AWG' | '3/0 AWG' | '4/0 AWG';

// Simulation-Specific Types
export interface SimulationContext {
  cycleTime: number;
  scanNumber: number;
  systemTime: Date;
  mode: 'run' | 'stop' | 'step' | 'pause';
  speed: number; // Hz
}

export interface DiagnosticInfo {
  elementId: UUID;
  timestamp: number;
  type: 'warning' | 'error' | 'info';
  code: string;
  message: string;
  data?: any;
}

// File I/O Types
export interface FileFormat {
  version: string;
  format: 'json' | 'xml' | 'ladder_xml' | 'iec_61131';
  compression?: boolean;
  encryption?: boolean;
}

export interface ImportExportOptions {
  includeComments: boolean;
  includeMetadata: boolean;
  includeValidationResults: boolean;
  format: FileFormat;
  targetVersion?: string;
}

// User Interface State
export interface UIState {
  selectedElements: UUID[];
  selectedConnections: UUID[];
  activeTool: string;
  zoom: number;
  panOffset: Point;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showAddresses: boolean;
  showWireNumbers: boolean;
  showDescriptions: boolean;
  simulationMode: boolean;
  debugMode: boolean;
}

// Project Management
export interface Project {
  id: UUID;
  name: string;
  description?: string;
  customerInfo?: CustomerInfo;
  diagrams: LadderDiagram[];
  globalSymbols: SymbolTable;
  settings: ProjectSettings;
  createdAt: Date;
  modifiedAt: Date;
}

export interface CustomerInfo {
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface SymbolTable {
  symbols: Map<string, SymbolDefinition>;
}

export interface SymbolDefinition {
  name: string;
  address: string;
  dataType: string;
  description?: string;
  scope: 'global' | 'local' | 'io';
  usage: 'input' | 'output' | 'internal' | 'system';
}

export interface ProjectSettings {
  defaultVoltage: string;
  defaultLanguage: string;
  backupEnabled: boolean;
  backupInterval: number; // minutes
  validationEnabled: boolean;
  standards: ComplianceStandard[];
  customTemplates: ComponentTemplate[];
}

export interface ComponentTemplate {
  id: UUID;
  name: string;
  type: ComponentType;
  defaultProperties: ComponentProperties;
  icon?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;