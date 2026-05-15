import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { CameraService } from '../services/camera.service';
import { GalleryService } from '../services/gallery.service';
import { IPhoto } from '../interfaces/photo.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  photos: IPhoto[] = [];
  capturing = false;

  constructor(
    private cameraService: CameraService,
    private galleryService: GalleryService,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.photos = await this.galleryService.load();
  }

  get isRearCamera(): boolean {
    return this.cameraService.isRearCamera;
  }

  async takePhoto() {
    try {
      this.capturing = true;
      const dataUrl = await this.cameraService.capture();
      this.photos = await this.galleryService.add(dataUrl);
      this.showToast('Foto guardada', 'success');
    } catch (error: any) {
      if (!error?.message?.toLowerCase().includes('cancel')) {
        this.showToast('No se pudo tomar la foto', 'danger');
      }
    } finally {
      this.capturing = false;
    }
  }

  toggleCamera() {
    this.cameraService.toggleCamera();
    this.showToast(this.isRearCamera ? 'Camara trasera' : 'Camara frontal', 'medium');
  }

  async openMenu(photo: IPhoto) {
    const sheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Compartir',
          icon: 'share-outline',
          handler: () => this.sharePhoto(photo)
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deletePhoto(photo)
        },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await sheet.present();
  }

  async sharePhoto(photo: IPhoto) {
    try {
      if (navigator.share) {
        const blob = await (await fetch(photo.dataUrl)).blob();
        const file = new File([blob], `snapdeck-${photo.id}.jpg`, { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'SnapDeck' });
      } else {
        const a = document.createElement('a');
        a.href = photo.dataUrl;
        a.download = `snapdeck-${photo.id}.jpg`;
        a.click();
        this.showToast('Foto descargada', 'success');
      }
    } catch {
      this.showToast('No se pudo compartir', 'warning');
    }
  }

  async deletePhoto(photo: IPhoto) {
    this.photos = await this.galleryService.remove(photo.id);
    this.showToast('Foto eliminada', 'danger');
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'top', color });
    await toast.present();
  }
}
