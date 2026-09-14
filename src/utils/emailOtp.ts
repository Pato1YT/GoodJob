import {doc, setDoc, getDoc, deleteDoc, Timestamp} from 'firebase/firestore';
import {db} from '../config/firebase';
import { EMAILJS_CONFIG } from '../config/emailjs';

const CODE_EXPIRATION_MINUTES =10;
function generaCodigo(): string{
    return Math.floor(100000 + Math.random() * 900000).toString();

}
async function enviarCorreo(email: string, codigo:string) {
    const response = await fetch('https:/api.emailjs.com/api/v1.0/email/send',{
        method: 'POST',
        headers: {'content-Type': 'application/json'},
        body: JSON.stringify({
            service_id: EMAILJS_CONFIG.serviceId,
            template_id: EMAILJS_CONFIG.templateId,
            user_id: EMAILJS_CONFIG.publicKey,
            template_params:{
                to_email: email,
                codigo,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al enviar  correo: ${errorText}`);
    }
    
}
export async function enviarCodigoOTP(uid: string, email: string): Promise<void> {
    const codigo = generaCodigo();
    const expiraEn = Timestamp.fromMillis(Date.now() + CODE_EXPIRATION_MINUTES * 60 *1000);

    await setDoc(doc(db, 'email_otp', uid), {codigo, expiraEn});
    await enviarCorreo(email, codigo);
    
}

export async function verificarCodigoOTP(uid: string, codigoIngresado: string): Promise<boolean>{
    const otpDoc = await getDoc(doc(db,'email_otp', uid));
    if (!otpDoc.exists()) return false;

 const {codigo, expiraEn} =otpDoc.data() as { codigo: string; expiraEn: Timestamp};

 const expirado = expiraEn.toMillis() < Date.now();
 if (expirado) {
    await deleteDoc(doc(db, 'email_otp', uid));
    return false;
 }
 const esValido = codigo === codigoIngresado;
 if(esValido){
    await deleteDoc(doc(db,'email_otp', uid));

 }
 return esValido;

}
export async function tiene2FAActivado(uid: string): Promise<boolean>{
    const configDoc = await getDoc(doc(db,'mfa_enabled', uid));
    return configDoc.exists();

}

export async function activar2FA(uid: string): Promise<void>{
    await setDoc(doc(db,'mfa_enabled',uid), { method: 'email', enabled: true});

}
export async function desactivar2FA(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'mfa_enabled',uid));
}