<template>
<div>
    <logo></logo>
    <div class="mt-3 d-none d-md-block"></div>
    <div class="container bg-dark pb-3 col-xs-12 col-sm-10 col-md-10 col-lg-6">
        <slot></slot>
        <footer class="mt-3">
            <div class="text-right">
                <a href="https://discord.com/invite/v7PD33d" target="_blank">Discord</a> |
                <a href="https://github.com/mike-eason/solaris" target="_blank">Source Code</a> |
                <a href="https://paypal.me/solarisgame?locale.x=en_GB" target="_blank">Donate</a>
            </div>
        </footer>
    </div>
    <div class="mb-3 d-none d-md-block"></div>
</div>
</template>

<script>
import LogoVue from '../components/Logo'

export default {
  components: {
    'logo': LogoVue
  }
}
</script>
