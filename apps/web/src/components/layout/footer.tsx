import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function Footer() {
  const t = useTranslations('navigation')

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AV</span>
              </div>
              <span className="font-bold text-xl">Homologaciones</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestión profesional de homologaciones vehiculares en Argentina.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Servicios</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/homologar" className="hover:text-primary transition-colors">
                  Homologación de Acoplados
                </Link>
              </li>
              <li>
                <Link href="/homologar" className="hover:text-primary transition-colors">
                  Homologación de Cajas Rodantes
                </Link>
              </li>
              <li>
                <Link href="/homologar" className="hover:text-primary transition-colors">
                  Homologación de Motorhomes
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AV Homologaciones. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
