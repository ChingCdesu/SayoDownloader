<template>
	<div class="song-card">
		<div class="covers">
			<div class="left-cover">
				<img
					class="img-cover"
					:src="`https://assets.ppy.sh/beatmaps/${this.BeatmapSet.id}/covers/list@2x.jpg`"
				/>
			</div>
			<div class="right-cover">
				<img
					class="img-cover"
					:src="`https://assets.ppy.sh/beatmaps/${this.BeatmapSet.id}/covers/card.jpg`"
				/>
			</div>
		</div>
		<div class="content">
			<div class="play" @click="this.addSongAndPlay">
				<font-awesome-icon :icon="['fas', 'play']" />
			</div>
			<div class="info" @click="this.modalVisible = true">
				<span class="song-title info-text">{{ this.displayTitle }}</span>
				<span class="song-artist info-text">作曲/歌手: {{ this.displayArtist }}</span>
				<span class="song-creator info-text">作图者: {{ this.BeatmapSet.creator }}</span>
				<el-space
					class="song-maps-inner"
					@mouseleave="this.mouseInDiffsDiv = false"
					@mouseenter="this.mouseInDiffsDiv = true"
				>
					<div :class="this.approvedClass">{{ this.approved }}</div>
					<div class="diffs">
						<el-space v-for="mode in this.modes" :key="mode" :size="3">
							<el-space v-if="this.mapFilter(mode).length !== 0" align="center" :size="this.diffspace">
								<i class="icon-osu diffs-mode-icon" :class="this.getModeIconClass(mode)" />
								<el-space
									v-if="this.mapFilter(mode).length < 15"
									class="diffs__inner"
									:size="this.diffspace"
								>
									<div
										class="diff"
										v-for="beatmap in this.mapFilter(mode)"
										:key="beatmap.id"
										:style="{ background: this.diffColor(beatmap.difficult) }"
									></div>
								</el-space>
								<span
									v-if="this.mapFilter(mode).length >= 15"
									class="diff-count"
								>{{ this.mapFilter(mode).length }}</span>
							</el-space>
						</el-space>
					</div>
				</el-space>
			</div>
			<div class="menu">
				<div class="menu-inner">
					<el-tooltip :content="this.downloadTooltip">
						<font-awesome-icon
							:icon="['fas', 'file-download']"
							class="fa-icon"
							@click="this.download"
							style="cursor: pointer"
						></font-awesome-icon>
					</el-tooltip>
				</div>
			</div>
		</div>
		<el-collapse-transition>
			<div
				class="diff-details"
				v-show="this.detailShow"
				@mouseenter="this.mouseInDetailDiv = true"
				@mouseleave="this.mouseInDetailDiv = false"
			>
				<el-space class="diff-details__inner" direction="vertical" alignment="start">
					<div class="diff-details__mode" v-for="mode in this.modes" :key="mode">
						<el-space
							class="diff-detail"
							:size="2"
							alignment="baseline"
							:key="map.id"
							v-for="map in this.mapFilter(mode)"
						>
							<i class="icon-osu detail-popover-mode-icon" :class="this.getModeIconClass(map.mode)" />
							<span class="stars" :style="{ background: this.diffColor(map.difficult) }">
								<font-awesome-icon :icon="['fas', 'star']" />
								{{ map.difficult.toFixed(2) }}
							</span>
							<span>{{ map.name }}</span>
						</el-space>
					</div>
				</el-space>
			</div>
		</el-collapse-transition>
		<el-dialog
			v-model="this.modalVisible"
			width="75%"
			:modal="true"
			:show-close="false"
			:destroy-on-close="true"
			:lock-scroll="true"
			:append-to-body="true"
			:center="true"
			custom-class="song-detail-modal"
		>
			<SongDetailModal :BeatmapSet="this.BeatmapSet" />
			<div
				class="modal-background"
				:style="{
					'background-image': `url(https://a.sayobot.cn/beatmaps/${this.BeatmapSet.id}/covers/cover.webp)`,
				}"
			></div>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import {
	PropType
} from "vue";
import {
	IBeatmapSet
} from "@src/common/interfaces/osu";
import {
	GameMode,
	Approved
} from "@src/common/enums/osu";
import store from "@src/common/utils/store";
import {
	IBeatmap
} from "@src/common/interfaces/osu";
import PlayerSingleton from "@src/common/utils/player";
import SongDetailModal from "./SongDetailModal.vue";
import {
	diffColor,
	getModeIconClass,
	gameModeString,
} from "@src/common/utils/osu";
import {
	newDownloadFile,
	getDownloadPath,
} from "@/hooks/download/ipc-renderer";

export default {
	name: "SongCard",
	components: {
		SongDetailModal,
	},
	props: {
		BeatmapSet: {
			type: Object as PropType<IBeatmapSet>,
			required: true,
		},
	},
	setup(props) {
		return {
			BeatmapSet: props.BeatmapSet,
			gameModeString,
			getModeIconClass,
			diffColor,
		};
	},
	data() {
		const player = PlayerSingleton.instance;
		return {
			diffspace: 1,
			modalVisible: false,
			mouseInDetailDiv: false,
			mouseInDiffsDiv: false,
			player,
			downloadTooltip: "下载",
			songDetailModalActiveMode: null,
			songDetailModalActiveDiffIndex: 0,
		};
	},
	methods: {
		mapFilter(mode: GameMode): IBeatmap[] {
			return this.BeatmapSet.maps.filter((v) => v.mode == mode);
		},
		addSongAndPlay() {
			if (this.BeatmapSet.audio) {
				const url = `https://dl.sayobot.cn/beatmaps/files/${this.BeatmapSet.id}/${this.BeatmapSet.audio}`;
				const title = `${this.displayTitle.toString()} - ${this.displayArtist.toString()}`;
				const id = this.player.addAudioToPlaylist(
					url,
					title,
					this.BeatmapSet.id as number
				);
				this.player.play(id);
			}
		},
		async download() {
			const url = `https://dl.sayobot.cn/beatmaps/download/${store.get('oszVersion')}/${this.BeatmapSet.id}`;
			const fileName = `${this.BeatmapSet.id} ${this.BeatmapSet.title} - ${this.BeatmapSet.artist}.osz`;
			const path = store.get('defaultDownloadPath');
			newDownloadFile({
				url,
				fileName,
				path,
			})
				.then((data) => {
					if (!data) {
						this.downloadTooltip = "已加入下载队列";
						setTimeout(() => {
							this.downloadTooltip = "下载";
						}, 4500);
						// @ts-ignore
						this.$notify({
							title: "正在下载...",
							message: `正在下载 ${fileName}到${path}。`,
							type: "success",
						});
					} else {
						// @ts-ignore
						this.$notify({
							title: "文件存在于下载队列",
							message: `${fileName} 正在下载中。`,
							type: "warning",
						});
					}
				})
				.catch((err) => {
					// @ts-ignore
					this.$notify({
						title: "出现错误",
						message: `将不会下载该文件。原因是：${err}。`,
						type: "error",
					});
				});
		},
	},
	computed: {
		approvedClass(): string {
			return Approved[this.BeatmapSet.approved] + " approved-status";
		},
		approved(): string {
			return Approved[this.BeatmapSet.approved].toUpperCase();
		},
		modes(): Set<GameMode> {
			let _modes: Set<GameMode> = new Set();
			this.BeatmapSet.maps.forEach((v) => {
				const _mode = v.mode;
				_modes.add(_mode);
			});
			return _modes;
		},
		detailShow(): boolean {
			return this.mouseInDetailDiv || this.mouseInDiffsDiv;
		},
		displayTitle(): String {
			const uni = store.get("displayWithUnicode");
			let ret: String | undefined;
			if (uni) ret = this.BeatmapSet?.titleU || this.BeatmapSet?.title;
			else ret = this.BeatmapSet?.title;
			return ret || "";
		},
		displayArtist(): String {
			const uni = store.get("displayWithUnicode");
			let ret: String | undefined;
			if (uni) ret = this.BeatmapSet?.artistU || this.BeatmapSet?.artist;
			else ret = this.BeatmapSet?.artist;
			return ret || "";
		},
	},
};
</script>

<style lang="less">
@song-card-radius: 10px;
@play-wrap-width: 120px;

.song-card {
	height: 100px;
	border-radius: @song-card-radius;
	overflow: visible;
	background-color: hsl(200, 10%, 30%);
	position: relative;
	cursor: pointer;

	.covers {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		overflow: hidden;
		border-radius: @song-card-radius;

		.img-cover {
			object-fit: cover;
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
		}

		.left-cover {
			width: @play-wrap-width + 10px;
			flex: none;
			position: relative;
			height: 100%;
			border-radius: @song-card-radius;
		}

		.right-cover {
			position: relative;
			height: 100%;
			flex: 1;
		}
	}

	.content {
		height: 100%;
		width: 100%;
		position: absolute;
		display: flex;
		flex-direction: row;

		.play {
			position: relative;
			padding: 15px;
			width: @play-wrap-width;
			height: 100%;
			border-radius: @song-card-radius 0 0 @song-card-radius;
			background-color: hsla(200, 10%, 10%, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			opacity: 0;
			color: #fff;
			flex: none;
			transition: all ease-in-out 0.15s;

			&:hover {
				color: hsl(45, 100%, 70%);
			}

			&::before,
			&::after {
				content: "";
				width: 10px;
				height: 10px;
				position: absolute;
				background-color: inherit;
				left: 100%;
			}

			&::before {
				top: 0;
				clip-path: path("M-1 -1 L-1 10 L0 10 A10 10 0 0 1 10 0 L10 -1 Z");
			}

			&::after {
				bottom: 0;
				clip-path: path("M-1 11 L-1 0 L0 0 A10 10 0 0 0 10 10 L10 11 Z");
			}
		}

		.info {
			display: flex;
			flex: 1;
			flex-direction: column;
			color: #fff;
			align-items: flex-start;
			text-align: start;
			justify-content: space-between;
			padding: 4px 10px 6px;
			background: linear-gradient(
				0.25turn,
				hsl(200, 10%, 20%),
				hsla(200, 10%, 20%, 0.8)
			);
			border-radius: 9px 0 0 9px;
			white-space: nowrap;
			width: calc(100% - 120px - 10px);

			.info-text {
				font-weight: 500;
				overflow: hidden;
				text-overflow: ellipsis;
				width: calc(100% - 20px);
			}

			.song-artist,
			.song-title {
				font-family: Torus, KiwiMaru, sans-serif;
				text-shadow: 0 1px 3px rgb(0 0 0 / 75%);
			}

			.song-title {
				font-size: 16px;
			}

			.song-artist {
				font-size: 14px;
			}

			.song-creator {
				font-size: 12px;
			}

			.song-maps-inner {
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
				width: 100%;

				.graveyard {
					background-color: hsl(200, 10%, 10%);
					color: hsl(200, 10%, 40%);
				}

				.wip {
					background-color: hsl(200, 40%, 80%);
					color: hsl(200, 10%, 25%);
				}

				.pending {
					background-color: hsl(45, 60%, 50%);
					color: hsl(200, 10%, 25%);
				}

				.qualified {
					background-color: hsl(45, 100%, 70%);
					color: hsl(200, 10%, 25%);
				}

				.approved {
					background-color: hsl(200, 40%, 80%);
					color: hsl(200, 10%, 40%);
				}

				.ranked {
					background-color: hsl(90, 100%, 70%);
					color: hsl(200, 10%, 40%);
				}

				.loved {
					background-color: hsl(333, 100%, 70%);
					color: hsl(200, 10%, 40%);
				}

				.approved-status {
					border-radius: 99px;
					font-weight: 800;
					font-size: 12px;
					line-height: 16px;
					padding: 0 5px;
				}

				.diffs {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;

					.diffs-mode-icon {
						font-size: 16px;
						margin-right: 1px;
					}

					.diff-count {
						font-weight: 800;
					}

					.diffs__inner {
						display: flex;
						flex-direction: row;
						justify-content: flex-start;

						.diff {
							width: 7px;
							height: 14px;
							border-radius: 14px;
						}
					}
				}
			}
		}

		.menu {
			width: 10px;
			background-color: hsl(200, 10%, 25%);
			border-radius: 0 10px 10px 0;
			transition: all 0.15s ease-in-out;
			position: relative;

			&::before,
			&::after {
				content: "";
				width: 10px;
				height: 10px;
				position: absolute;
				background-color: inherit;
				right: 100%;
			}

			&::before {
				top: 0;
				clip-path: path("M11 -1 L11 10 L10 10 A10 10 0 0 0 0 0 L0 -1 Z");
			}

			&::after {
				bottom: 0;
				clip-path: path("M11 11 L11 0 L10 0 A10 10 0 0 1 0 10 L 0 11 Z");
			}

			.menu-inner {
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				opacity: 0;
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;
				align-items: center;
				font-size: 12px;
				transition: all 0.15s ease-in-out;

				.fa-icon {
					color: hsl(200, 40%, 90%);
				}
			}
		}
	}

	.diff-details {
		position: absolute;
		top: 0;
		margin-top: 90px;
		left: 0;
		width: 100%;
		z-index: 4;

		.diff-details__inner {
			margin-top: 10px;
			padding: 5px 5px;
			border-radius: 0 0 @song-card-radius @song-card-radius;
			background-color: hsla(200, 10%, 30%, 0.7);
			backdrop-filter: blur(5px);
			overflow: visible;
			width: 100%;

			&::before,
			&::after {
				content: "";
				position: absolute;
				background-color: inherit;
				top: -10px;
				height: 10px;
				width: 10px;
			}

			&::before {
				left: 0;
				clip-path: path("M0 0 L0 11 L10 11 L10 10 A10 10 0 0 1 0 0 Z");
			}

			&::after {
				right: 0;
				clip-path: path("M10 0 A10 10 0 0 1 0 10 L0 11 L10 11 L10 0 Z");
			}

			.diff-details__mode {
				display: flex;
				flex-direction: column;

				.diff-detail {
					height: 15px;
					font-size: 12px;
					font-weight: 500;
					align-items: center;
					color: #fff;
					margin: 1px;

					.detail-popover-mode-icon {
						font-size: 14px;
					}

					.stars {
						padding: 0 6px;
						color: hsl(200, 10%, 10%);
						border-radius: 15px;

						.fa-star {
							width: 0.9em;
						}
					}
				}
			}
		}
	}

	&:hover {
		z-index: 6;

		.menu {
			width: 30px;

			.menu-inner {
				opacity: 1;
			}
		}

		.info {
			width: calc(100% - 120px - 30px);
		}

		.play {
			opacity: 1;
		}
	}
}

.song-detail-modal {
	background: none;
	border-radius: @song-card-radius;
	overflow: hidden;
	box-shadow: 0 0 10px #fff;

	.el-dialog__header {
		display: none;
	}

	.el-dialog__body {
		color: #fff;
		background-color: hsla(200, 10%, 20%, 0.7);
		backdrop-filter: blur(5px);
	}

	.modal-background {
		pointer-events: none;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		opacity: 0.2;
		filter: blur(5px);
	}
}
</style>
