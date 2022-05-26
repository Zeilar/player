import { Story, Meta } from "@storybook/react";
import { Player, PlayerProps } from ".";

export default {
	component: Player,
	title: "Player",
} as Meta;

const Template: Story<PlayerProps> = args => (
	<div style={{ width: 1000 }}>
		<Player {...args} />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {
	src: {
		1080: "/1080.mp4",
		720: "/720.mp4",
		640: "/640.mp4",
		480: "/480.mp4",
		Default: "/subtitles.mp4",
	},
	captions: [{ language: "en", src: "/subtitles.vtt", label: "English" }],
};
