import React, { useState, useEffect } from 'react';
// Circuit Simulation Engine Architecture

interface SimulationEngine {
  initialize(diagram: any): void;
  start(): void;
  stop(): void;
  step(): void;
  reset(): void;
  getState(): SimulationState;
  setSpeed(speed: number): void;
  addStateListener(listener: StateChangeListener): void;
  removeStateListener(listener: StateChangeListener): void;
}

interface StateChangeListener {
  (state: SimulationState): void;
}

interface SimulationState {
  isRunning: boolean;
  timestamp: number;
  elementStates: Map<string, ElementSimulationState>;
  connectionStates: Map<string, ConnectionState>;
  globalVariables: Map<string, any>;
  errors: SimulationError[];
  performance: PerformanceMetrics;
}

interface ElementSimulationState {
  elementId: string;
  energized: boolean;
  inputs: Signal[];
  outputs: Signal[];
  internalState: Map<string, any>;
  lastUpdated: number;
}

interface ConnectionState {
  connectionId: string;
  energized: boolean;
  signal: Signal;
}

interface Signal {
  value: boolean | number;
  source: string;
  timestamp: number;
  quality: 'good' | 'uncertain' | 'bad';
}

interface SimulationError {
  id: string;
  type: 'logic' | 'connection' | 'component' | 'performance';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  elementId?: string;
  timestamp: number;
}

interface PerformanceMetrics {
  cycleTime: number;
  averageCycleTime: number;
  maxCycleTime: number;
  cyclesPerSecond: number;
}

// Main Simulation Engine Implementation
class LadderSimulationEngine implements SimulationEngine {
  private diagram: any | null = null;
  private state: SimulationState;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;
  private cycleInterval: number = 50; // 20 Hz default
  private componentLibrary: any;
  private stateListeners: Set<StateChangeListener> = new Set();
  private performanceMonitor: PerformanceMonitor;
  
  constructor(componentLibrary: any) {
    this.componentLibrary = componentLibrary;
    this.performanceMonitor = new PerformanceMonitor();
    this.state = this.createInitialState();
  }
  
  initialize(diagram: any): void {
    this.diagram = diagram;
    this.state = this.createInitialState();
    this.buildSimulationNetwork();
  }
  
  start(): void {
    if (!this.diagram) {
      throw new Error('Simulation not initialized with diagram');
    }
    
    this.isRunning = true;
    this.state.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.runSimulationLoop();
  }
  
  stop(): void {
    this.isRunning = false;
    this.state.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  step(): void {
    if (!this.diagram) return;
    
    const startTime = performance.now();
    this.executeSimulationCycle();
    this.performanceMonitor.recordCycle(performance.now() - startTime);
    this.notifyStateChange();
  }
  
  reset(): void {
    this.stop();
    this.state = this.createInitialState();
    if (this.diagram) {
      this.buildSimulationNetwork();
    }
    this.notifyStateChange();
  }
  
  getState(): SimulationState {
    return { ...this.state };
  }
  
  setSpeed(speed: number): void {
    this.cycleInterval = 1000 / speed; // Convert Hz to milliseconds
  }
  
  addStateListener(listener: StateChangeListener): void {
    this.stateListeners.add(listener);
  }
  
  removeStateListener(listener: StateChangeListener): void {
    this.stateListeners.delete(listener);
  }
  
  private runSimulationLoop(): void {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    
    if (deltaTime >= this.cycleInterval) {
      this.step();
      this.lastUpdateTime = currentTime;
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.runSimulationLoop());
  }
  
  private executeSimulationCycle(): void {
    if (!this.diagram) return;
    
    // Clear previous errors
    this.state.errors = [];
    
    // Process each rung sequentially (left-to-right evaluation)
    this.diagram.rungs.forEach((rung, index) => {
      this.processRung(rung, index);
    });
    
    // Update timestamp
    this.state.timestamp = performance.now();
    
    // Update performance metrics
    this.state.performance = this.performanceMonitor.getMetrics();
  }
  
  private processRung(rung: any, rungIndex: number): void {
    // Build execution order for this rung
    const executionOrder = this.buildExecutionOrder(rung);
    
    // Process elements in execution order
    executionOrder.forEach(elementId => {
      this.processElement(elementId);
    });
    
    // Process connections
    this.processConnections(rung);
  }
  
  private buildExecutionOrder(rung: any): string[] {
    // Create dependency graph and topological sort
    const dependencies = new Map<string, string[]>();
    const elements = new Map<string, LadderElement>();
    
    // Build element map
    rung.elements.forEach(element => {
      elements.set(element.id, element);
      dependencies.set(element.id, []);
    });
    
    // Build dependencies based on connections
    rung.connections.forEach(connection => {
      const fromDeps = dependencies.get(connection.from.elementId) || [];
      if (!fromDeps.includes(connection.to.elementId)) {
        fromDeps.push(connection.to.elementId);
        dependencies.set(connection.from.elementId, fromDeps);
      }
    });
    
    // Topological sort
    return this.topologicalSort(dependencies);
  }
  
  private topologicalSort(dependencies: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);
      
      const deps = dependencies.get(node) || [];
      deps.forEach(dep => visit(dep));
      
      result.push(node);
    };
    
    dependencies.forEach((_, node) => visit(node));
    return result;
  }
  
  private processElement(elementId: string): void {
    const elementState = this.state.elementStates.get(elementId);
    if (!elementState) return;
    
    const element = this.findElement(elementId);
    if (!element) return;
    
    const componentDef = this.componentLibrary.getComponent(element.type);
    if (!componentDef) return;
    
    try {
      // Get input signals
      const inputs = this.getElementInputs(elementId);
      
      // Execute component logic
      const output = componentDef.simulationBehavior.logic(
        elementState,
        inputs,
        element.properties
      );
      
      // Update element state
      const newElementState: ElementSimulationState = {
        ...elementState,
        energized: output.energized,
        outputs: output.outputs || [],
        internalState: new Map(Object.entries(output).filter(([key]) => 
          !['energized', 'outputs'].includes(key)
        ).map(([key, value]) => [key, value])),
        lastUpdated: performance.now()
      };
      
      this.state.elementStates.set(elementId, newElementState);
      
    } catch (error) {
      this.state.errors.push({
        id: `element_${elementId}_${Date.now()}`,
        type: 'component',
        severity: 'error',
        message: `Error processing element ${elementId}: ${error}`,
        elementId,
        timestamp: performance.now()
      });
    }
  }
  
  private getElementInputs(elementId: string): Signal[] {
    const inputs: Signal[] = [];
    const element = this.findElement(elementId);
    if (!element) return inputs;
    
    // Find connections to this element's input terminals
    const diagram = this.diagram!;
    diagram.rungs.forEach(rung => {
      rung.connections.forEach(connection => {
        if (connection.to.elementId === elementId) {
          const sourceState = this.state.elementStates.get(connection.from.elementId);
          if (sourceState) {
            const outputIndex = this.getTerminalOutputIndex(connection.from.terminal);
            const outputSignal = sourceState.outputs[outputIndex];
            
            inputs.push({
              value: outputSignal?.value || false,
              source: connection.from.elementId,
              timestamp: sourceState.lastUpdated,
              quality: 'good'
            });
          }
        }
      });
    });
    
    return inputs;
  }
  
  private getTerminalOutputIndex(terminal: any): number {
    // Simplified - would need proper terminal mapping
    return 0;
  }
  
  private processConnections(rung: any): void {
    rung.connections.forEach(connection => {
      const sourceState = this.state.elementStates.get(connection.from.elementId);
      if (!sourceState) return;
      
      const outputIndex = this.getTerminalOutputIndex(connection.from.terminal);
      const outputSignal = sourceState.outputs[outputIndex];
      
      const connectionState: ConnectionState = {
        connectionId: connection.id,
        energized: outputSignal?.value ? true : false,
        signal: outputSignal || { value: false, source: '', timestamp: 0, quality: 'bad' }
      };
      
      this.state.connectionStates.set(connection.id, connectionState);
    });
  }
  
  private findElement(elementId: string): any | null {
    if (!this.diagram) return null;
    
    for (const rung of this.diagram.rungs) {
      const element = rung.elements.find(el => el.id === elementId);
      if (element) return element;
    }
    
    return null;
  }
  
  private buildSimulationNetwork(): void {
    if (!this.diagram) return;
    
    // Initialize element states
    this.state.elementStates.clear();
    this.state.connectionStates.clear();
    
    this.diagram.rungs.forEach(rung => {
      rung.elements.forEach(element => {
        const componentDef = this.componentLibrary.getComponent(element.type);
        if (componentDef) {
          const elementState: ElementSimulationState = {
            elementId: element.id,
            energized: componentDef.simulationBehavior.initialState.energized,
            inputs: [],
            outputs: [],
            internalState: new Map(Object.entries(
              componentDef.simulationBehavior.initialState
            ).filter(([key]) => key !== 'energized').map(([key, value]) => [key, value])),
            lastUpdated: 0
          };
          
          this.state.elementStates.set(element.id, elementState);
        }
      });
      
      rung.connections.forEach(connection => {
        const connectionState: ConnectionState = {
          connectionId: connection.id,
          energized: false,
          signal: { value: false, source: '', timestamp: 0, quality: 'bad' }
        };
        
        this.state.connectionStates.set(connection.id, connectionState);
      });
    });
  }
  
  private createInitialState(): SimulationState {
    return {
      isRunning: false,
      timestamp: 0,
      elementStates: new Map(),
      connectionStates: new Map(),
      globalVariables: new Map(),
      errors: [],
      performance: {
        cycleTime: 0,
        averageCycleTime: 0,
        maxCycleTime: 0,
        cyclesPerSecond: 0
      }
    };
  }
  
  private notifyStateChange(): void {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
}

// Performance Monitoring
class PerformanceMonitor {
  private cycleTimes: number[] = [];
  private maxCycleHistory = 100;
  
  recordCycle(cycleTime: number): void {
    this.cycleTimes.push(cycleTime);
    if (this.cycleTimes.length > this.maxCycleHistory) {
      this.cycleTimes.shift();
    }
  }
  
  getMetrics(): PerformanceMetrics {
    if (this.cycleTimes.length === 0) {
      return {
        cycleTime: 0,
        averageCycleTime: 0,
        maxCycleTime: 0,
        cyclesPerSecond: 0
      };
    }
    
    const latest = this.cycleTimes[this.cycleTimes.length - 1];
    const average = this.cycleTimes.reduce((a, b) => a + b, 0) / this.cycleTimes.length;
    const max = Math.max(...this.cycleTimes);
    const cps = 1000 / average;
    
    return {
      cycleTime: latest,
      averageCycleTime: average,
      maxCycleTime: max,
      cyclesPerSecond: cps
    };
  }
  
  reset(): void {
    this.cycleTimes = [];
  }
}

// Simulation Controls UI Component
export const SimulationControls: React.FC<{
  engine: SimulationEngine;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
}> = ({ engine, isRunning, onToggleRun, onStep, onReset }) => {
  const [speed, setSpeed] = useState(20);
  const [showDebug, setShowDebug] = useState(false);
  const [debugState, setDebugState] = useState<SimulationState | null>(null);
  
  useEffect(() => {
    const handleStateChange = (state: SimulationState) => {
      setDebugState(state);
    };
    
    engine.addStateListener(handleStateChange);
    return () => engine.removeStateListener(handleStateChange);
  }, [engine]);
  
  useEffect(() => {
    engine.setSpeed(speed);
  }, [speed, engine]);
  
  return (
    <div className="simulation-controls">
      <div className="control-buttons">
        <button 
          onClick={onToggleRun}
          className={`run-button ${isRunning ? 'running' : 'stopped'}`}
        >
          {isRunning ? 'Stop' : 'Run'}
        </button>
        
        <button 
          onClick={onStep}
          disabled={isRunning}
          className="step-button"
        >
          Step
        </button>
        
        <button 
          onClick={onReset}
          className="reset-button"
        >
          Reset
        </button>
      </div>
      
      <div className="speed-control">
        <label>Speed: {speed} Hz</label>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>
      
      <div className="debug-toggle">
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide' : 'Show'} Debug
        </button>
      </div>
      
      {showDebug && debugState && (
        <div className="debug-panel">
          <h3>Debug Information</h3>
          <div className="performance">
            <p>Cycle Time: {debugState.performance.cycleTime.toFixed(2)}ms</p>
            <p>Average: {debugState.performance.averageCycleTime.toFixed(2)}ms</p>
            <p>FPS: {debugState.performance.cyclesPerSecond.toFixed(1)}</p>
          </div>
          
          <div className="errors">
            {debugState.errors.length > 0 && (
              <h4>Errors:</h4>
            )}
            {debugState.errors.map(error => (
              <div key={error.id} className={`error ${error.severity}`}>
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};