import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IPhoto } from '../interfaces/photo.interface';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly KEY = 'snapdeck_photos';

  async load(): Promise<IPhoto[]> {
    const { value } = await Preferences.get({ key: this.KEY });
    return value ? JSON.parse(value) : [];
  }

  async add(dataUrl: string): Promise<IPhoto[]> {
    const photos = await this.load();
    photos.unshift({ id: Date.now().toString(), dataUrl, timestamp: Date.now() });
    await Preferences.set({ key: this.KEY, value: JSON.stringify(photos) });
    return photos;
  }

  async remove(id: string): Promise<IPhoto[]> {
    const photos = await this.load();
    const updated = photos.filter(p => p.id !== id);
    await Preferences.set({ key: this.KEY, value: JSON.stringify(updated) });
    return updated;
  }
}
