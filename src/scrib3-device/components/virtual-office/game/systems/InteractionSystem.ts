import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';
import { useOfficeStore } from '../../../../store/office.store';

export interface InteractableData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const INTERACT_DISTANCE = 48; // 1.5 tiles

export class InteractionSystem {
  private interactables: InteractableData[] = [];
  private nearestId: string | null = null;
  private interactCooldown = 0;

  constructor(_scene: Phaser.Scene) {}

  registerObject(data: InteractableData): void {
    this.interactables.push(data);
  }

  loadFromObjectLayer(map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    const layer = map.getObjectLayer(layerName);
    if (!layer) return;

    for (const obj of layer.objects) {
      if (obj.name && obj.x != null && obj.y != null) {
        const props = obj.properties as Array<{ name: string; value: string }> | undefined;
        const typeProp = props?.find(p => p.name === 'type');
        this.registerObject({
          id: obj.name,
          type: typeProp?.value ?? 'generic',
          x: obj.x + (obj.width ?? 32) / 2,
          y: obj.y + (obj.height ?? 32) / 2,
          width: obj.width ?? 32,
          height: obj.height ?? 32,
        });
      }
    }
  }

  update(playerX: number, playerY: number, interactPressed: boolean): void {
    let nearest: InteractableData | null = null;
    let nearestDist = Infinity;

    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(playerX, playerY, obj.x, obj.y);
      if (dist < INTERACT_DISTANCE && dist < nearestDist) {
        nearest = obj;
        nearestDist = dist;
      }
    }

    const newId = nearest?.id ?? null;
    if (newId !== this.nearestId) {
      this.nearestId = newId;
      if (nearest) {
        useOfficeStore.getState().setInteractionPrompt(
          `Press E — ${formatLabel(nearest.type, nearest.id)}`
        );
      } else {
        useOfficeStore.getState().setInteractionPrompt(null);
      }
    }

    // Handle interaction
    if (this.interactCooldown > 0) {
      this.interactCooldown--;
      return;
    }

    if (interactPressed && nearest) {
      this.interactCooldown = 30; // ~0.5s at 60fps
      bridge.emit('interaction:trigger', {
        objectId: nearest.id,
        objectType: nearest.type,
      });
    }
  }
}

function formatLabel(type: string, id: string): string {
  switch (type) {
    case 'desk': return `Sit at desk`;
    case 'whiteboard': return 'View whiteboard';
    case 'coffee': return 'Grab a coffee';
    case 'meeting': return 'Join meeting';
    case 'bulletin': return 'Read announcements';
    case 'phone': return 'Make a call';
    case 'easter_egg': return 'Hack the mainframe';
    default: return id;
  }
}
