import { NgModule }     from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule }    from './app.module';
import { AppComponent } from './app.component';

@NgModule({
imports: [
    ServerModule,
    AppModule
],
bootstrap: [AppComponent]
})
export class AppServerModule { }

// https://coursetro.com/posts/code/68/Make-your-Angular-App-SEO-Friendly-(Angular-4-+-Universal)
// https://medium.com/@cyrilletuzi/angular-server-side-rendering-in-node-with-express-universal-engine-dce21933ddce
