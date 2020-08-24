import Phaser from 'phaser';
import oneBitSpritesheet from './assets/monochrome_tilemap_transparent.png';
import oneBitSpritesheet2 from './assets/colored_transparent.png';
import testMap from './assets/test.json';


class MyScene extends Phaser.Scene {
    preload() {
        this.load.spritesheet('1bit', oneBitSpritesheet, { frameWidth: 16, frameHeight: 16, spacing: 1 });
        this.load.image('1bit2', oneBitSpritesheet2);
        this.load.tilemapTiledJSON('testMap', testMap);
    }
    create() {
        this.body = this.add.sprite(0, 0, '1bit', 241);
        this.body.name = 'body';
        console.log('body size', this.body.width, this.body.height);

        this.gun = this.add.sprite(0, 0, '1bit', 97);
        this.gun.name = 'gun';
        this.gun.setTint(0x00ff00);
        this.gun.setOrigin(0.33, 0.5);
        console.log('gun size', this.gun.width, this.gun.height);

        this.guy = this.add.container(100, 100, [this.body, this.gun]);

        //  A Container has a default size of 0x0, so we need to give it a size before enabling a physics
        //  body or it'll be given the default body size of 64x64.
        this.guy.setSize(this.body.width - 4, this.body.height - 4);
        this.guy.setDepth(100);
        console.log('guy size', this.guy.width, this.guy.height);


        // animation
        const something = this.anims.create({
            key: 'something',
            frames: this.anims.generateFrameNumbers('1bit', {
                start: 241,
                end: 245
            }),
            repeat: -1
        });
        this.body.play('something');
        something.pause();

        this.input.on('pointerdown', () => {
            something.resume();
        });

        this.input.on('pointerup', () => {
            something.pause();
        });
        // animation end

        // map and collisions start
        this.map = this.make.tilemap({ key: 'testMap' });
        const tileset = this.map.addTilesetImage('colored_transparent', '1bit2');
        const layer1 = this.map.createStaticLayer('Tile Layer 1', tileset);
        const layer2 = this.map.createStaticLayer('Tile Layer 2', tileset);
        layer2.setCollision([49, 50, 51, 52, 53,54, 100, 101], true, true);

        this.guy = this.physics.add.existing(this.guy);
        this.physics.add.collider(this.guy, layer2);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels); // update world bounds to match map dimensions
        this.guy.body.setCollideWorldBounds(true);
        // map and collisions end

        this.debugGraphics = this.add.graphics();

        this.cameras.main.startFollow(this.guy);

        // hp start
        this.maxHp = 100;
        this.currentHp = 80;

        this.hpBarBg = this.add.rectangle(10 - 2, 10 - 2, 100 + 4, 10 + 4, 0x222222)
            .setOrigin(0.0, 0.0)
            .setScrollFactor(0);
        this.hpBar = this.add.rectangle(10, 10, (this.currentHp / this.maxHp) * 100, 10, 0xff0000)
            .setOrigin(0.0, 0.0)
            .setScrollFactor(0);

        this.events.on('changeHp', (amnt) => {
            this.currentHp += amnt;
            this.hpBar.setSize((this.currentHp / this.maxHp) * 100, this.hpBar.height);
        });
        // hp end

    }
    update(_time, dt) {
        this.input.mousePointer.updateWorldPoint(this.cameras.main); // needed for mouse navigation - without it `mousePointer.worldX` and `...worldY` point to last (unchanged) mouse position when mouse is NOT moved around (/pointer position updated only when mouse is moved unless this method is called)

        const gunAngle = Phaser.Math.Angle.Between(this.guy.x + this.gun.x, this.guy.y + this.gun.y, this.input.mousePointer.worldX, this.input.mousePointer.worldY);
        this.gun.setRotation(gunAngle);

        this.guy.body.setVelocity(0);
        if (this.input.mousePointer.isDown) {
            const distance = Phaser.Math.Distance.Between(this.guy.x, this.guy.y, this.input.mousePointer.worldX, this.input.mousePointer.worldY);
            if (distance > 5) { // prevent shaking
                const guyAngle = Phaser.Math.Angle.Between(this.guy.x, this.guy.y, this.input.mousePointer.worldX, this.input.mousePointer.worldY);
                this.guy.body.setVelocityX(100 * Math.cos(guyAngle));
                this.guy.body.setVelocityY(100 * Math.sin(guyAngle));

                this.events.emit('changeHp', -0.1);
            }
        }

        // this.debugGraphics.clear();
        // this.map.renderDebugFull(this.debugGraphics, {
        //     tileColor: null, // Non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        // });

    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 360,
    height: 200,
    zoom: 3,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: MyScene,
    render: {
        pixelArt: true
    },
    backgroundColor: 0x472d3c
};

const game = new Phaser.Game(config);
