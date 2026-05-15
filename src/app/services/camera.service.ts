import { Injectable } from '@angular/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class CameraService {
  private rearCamera = true;

  async capture(): Promise<string> {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      direction: this.rearCamera ? CameraDirection.Rear : CameraDirection.Front,
    });
    return photo.dataUrl!;
  }

  toggleCamera() {
    this.rearCamera = !this.rearCamera;
  }

  get isRearCamera(): boolean {
    return this.rearCamera;
  }
}
